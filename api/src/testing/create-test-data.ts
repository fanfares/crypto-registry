import {Network, ResetDataOptions} from '@bcr/types';
import {ApiConfigService} from '../api-config';
import {SubmissionService} from '../submission';
import {exchangeMnemonic, faucetMnemonic} from '../crypto/exchange-mnemonic';
import {Bip84Account} from '../crypto/bip84-account';
import {WalletService} from '../crypto/wallet.service';
import {DbService} from '../db/db.service';
import {MessageSenderService} from '../network/message-sender.service';
import {resetRegistryWalletHistory} from '../crypto/reset-registry-wallet-history';
import {BitcoinServiceFactory} from '../crypto/bitcoin-service-factory';
import {NodeService} from '../node';

export const createTestData = async (
  dbService: DbService,
  apiConfigService: ApiConfigService,
  submissionService: SubmissionService,
  walletService: WalletService,
  messageSenderService: MessageSenderService,
  bitcoinServiceFactory: BitcoinServiceFactory,
  nodeService: NodeService,
  options?: ResetDataOptions
): Promise<void> => {
  if ( options?.resetVerificationsAndSubmissionsOnly) {
    await dbService.customerHoldings.deleteMany({});
    await dbService.submissions.deleteMany({});
    await dbService.verifications.deleteMany({});
    await dbService.submissionConfirmations.deleteMany({});
  } else {
    await dbService.reset();

    await dbService.users.insert({
      email: apiConfigService.ownerEmail,
      isVerified: false
    });
  }

  await dbService.mockAddresses.deleteMany({})
  await dbService.mockTransactions.deleteMany({})

  await nodeService.onModuleInit();

  if (apiConfigService.forcedLeader) {
    const nodes = await dbService.nodes.find({})

    for (const node of nodes) {
      await dbService.nodes.update(node._id, {
        isLeader: apiConfigService.forcedLeader ? apiConfigService.forcedLeader === node.address : false,
        leaderVote: apiConfigService.forcedLeader ?? ''
      })
    }
  }

  if (!options?.dontResetWalletHistory) {
    await resetRegistryWalletHistory( dbService, apiConfigService, bitcoinServiceFactory, Network.testnet);
    await resetRegistryWalletHistory( dbService, apiConfigService, bitcoinServiceFactory, Network.mainnet);
  }

  if (apiConfigService.isTestMode || apiConfigService.bitcoinApi === 'mock') {
    const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    const faucetZpub = Bip84Account.zpubFromMnemonic(faucetMnemonic);
    let receivingAddress = await walletService.getReceivingAddress(faucetZpub, 'faucet', Network.testnet);
    await dbService.mockAddresses.findOneAndUpdate({
      address: receivingAddress
    }, {
      balance: 10000000000
    });

    receivingAddress = await walletService.getReceivingAddress(exchangeZpub, 'exchange', Network.testnet);
    await walletService.sendFunds(faucetZpub, receivingAddress, 30000000);
  }
};
