import { Network, ResetDataOptions, SubmissionDto } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { getHash } from '../utils';
import { SubmissionService } from '../submission';
import { exchangeMnemonic, faucetMnemonic } from '../crypto/exchange-mnemonic';
import { Bip84Account } from '../crypto/bip84-account';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { MessageSenderService } from '../network/message-sender.service';
import { resetRegistryWalletHistory } from '../crypto/reset-registry-wallet-history';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';

export interface TestDataOptions {
  createSubmission?: boolean;
  completeSubmission?: boolean;
}

export interface TestIds {
  submissionAddress: string;
  customerEmail: string;
  exchangeName: string;
}

export const testCustomerEmail = 'customer-1@mail.com';

export const createTestData = async (
  dbService: DbService,
  apiConfigService: ApiConfigService,
  submissionService: SubmissionService,
  walletService: WalletService,
  messageSenderService: MessageSenderService,
  bitcoinServiceFactory: BitcoinServiceFactory,
  options?: ResetDataOptions
): Promise<TestIds> => {
  await dbService.reset();
  await messageSenderService.onModuleInit();

  if (!options?.dontResetWalletHistory) {
    await resetRegistryWalletHistory( dbService, apiConfigService, bitcoinServiceFactory, Network.testnet);
    await resetRegistryWalletHistory( dbService, apiConfigService, bitcoinServiceFactory, Network.mainnet);
  }

   await dbService.users.insert({
     email: apiConfigService.ownerEmail,
     isVerified: false
   });

  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const faucetZpub = Bip84Account.zpubFromMnemonic(faucetMnemonic);

  if (apiConfigService.isTestMode) {
    let receivingAddress = await walletService.getReceivingAddress(faucetZpub, 'faucet', Network.testnet);
    await dbService.mockAddresses.findOneAndUpdate({
      address: receivingAddress
    }, {
      balance: 10000000000
    });

    receivingAddress = await walletService.getReceivingAddress(exchangeZpub, 'exchange', Network.testnet);
    await walletService.sendFunds(faucetZpub, receivingAddress, 30000000);
  }

  let submission: SubmissionDto;
  const exchangeName = 'Exchange 1';
  if (options?.createSubmission) {

    submission = await submissionService.createSubmission({
      initialNodeAddress: apiConfigService.nodeAddress,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: getHash(testCustomerEmail, apiConfigService.hashingAlgorithm),
        amount: 10000000
      }, {
        hashedEmail: getHash('customer-2@mail.com', apiConfigService.hashingAlgorithm),
        amount: 20000000
      }]
    });

    if (options?.completeSubmission) {
      await walletService.sendFunds(exchangeZpub, submission.paymentAddress, submission.paymentAmount);
      await submissionService.getSubmissionStatus(submission.paymentAddress);
    }
  }

  return {
    submissionAddress: submission?.paymentAddress ?? null,
    customerEmail: testCustomerEmail,
    exchangeName: exchangeName
  };
};
