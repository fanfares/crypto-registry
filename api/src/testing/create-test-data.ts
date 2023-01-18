import { Network, SubmissionStatusDto } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { getHash } from '../utils';
import { SubmissionService } from '../submission';
import { exchangeMnemonic, faucetMnemonic } from '../crypto/exchange-mnemonic';
import { getZpubFromMnemonic } from '../crypto/get-zpub-from-mnemonic';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';

export interface TestDataOptions {
  createSubmission?: boolean;
  completeSubmission?: boolean;
}

export interface TestIds {
  submissionAddress: string;
  customerEmail: string;
  exchangeName: string;
}

export const createTestData = async (
  dbService: DbService,
  apiConfigService: ApiConfigService,
  exchangeService: SubmissionService,
  walletService: WalletService,
  options?: TestDataOptions
): Promise<TestIds> => {
  await dbService.reset();

  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', Network.testnet);
  const faucetZpub = getZpubFromMnemonic(faucetMnemonic, 'password', Network.testnet);

  if (apiConfigService.isTestMode) {
    let receivingAddress = await walletService.getReceivingAddress(faucetZpub, 'faucet');
    await dbService.mockAddresses.findOneAndUpdate({
      address: receivingAddress
    }, {
      balance: 10000000000
    });

    receivingAddress = await walletService.getReceivingAddress(exchangeZpub, 'exchange');
    await walletService.sendFunds(faucetZpub, receivingAddress, 30000000);
  }

  let submission: SubmissionStatusDto;
  const customerEmail = 'customer-1@mail.com';
  const exchangeName = 'Exchange 1';
  if (options?.createSubmission) {
    submission = await exchangeService.createSubmission({
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      network: Network.testnet,
      customerHoldings: [{
        hashedEmail: getHash(customerEmail, apiConfigService.hashingAlgorithm),
        amount: 10000000
      }, {
        hashedEmail: getHash('customer-2@mail.com', apiConfigService.hashingAlgorithm),
        amount: 20000000
      }]
    });

    if (options?.completeSubmission) {
      await walletService.sendFunds(exchangeZpub, submission.paymentAddress, submission.paymentAmount);
      await exchangeService.getSubmissionStatus(submission.paymentAddress);
    }
  }

  return {
    submissionAddress: submission?.paymentAddress ?? null,
    customerEmail: customerEmail,
    exchangeName: exchangeName
  };
};
