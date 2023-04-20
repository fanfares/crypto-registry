import { Network, ResetDataOptions } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { SubmissionService } from '../submission';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { MessageSenderService } from '../network/message-sender.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { MockWalletService } from "../crypto/mock-wallet.service";

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
  if (options?.resetVerificationsAndSubmissions) {
    await dbService.customerHoldings.deleteMany({});
    await dbService.submissions.deleteMany({});
    await dbService.verifications.deleteMany({});
    await dbService.submissionConfirmations.deleteMany({});

  } else if (options?.resetAll) {
    await dbService.reset();
    await dbService.users.insert({
      email: apiConfigService.ownerEmail,
      isVerified: false
    });
    await nodeService.onModuleInit();
  }

  if (apiConfigService.forcedLeader) {
    const nodes = await dbService.nodes.find({})

    for (const node of nodes) {
      await dbService.nodes.update(node._id, {
        isLeader: apiConfigService.forcedLeader ? apiConfigService.forcedLeader === node.address : false,
        leaderVote: apiConfigService.forcedLeader ?? ''
      })
    }
  }

  if ( options?.resetMockWallet ) {
    await dbService.mockAddresses.deleteMany({})
    await dbService.mockTransactions.deleteMany({})
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.testnet), false);
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.mainnet), false);
  }

  if (options?.resetWallet) {
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.testnet), false);
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.mainnet), false);
  }

  if ( walletService instanceof  MockWalletService ) {
    await walletService.reset()
  }
};
