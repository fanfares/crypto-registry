import { SubmissionStatusDto, UserIdentity } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { getHash } from '../utils';
import { SubmissionService } from '../submission';
import { exchangeMnemonic, faucetMnemonic } from '../crypto/test-wallet-mnemonic';
import { getZpubFromMnemonic } from '../crypto/get-zpub-from-mnemonic';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';

export interface TestDataOptions {
  createSubmission: boolean;
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
  const identity: UserIdentity = { type: 'reset' };
  await dbService.reset();

  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet');
  const faucetZpub = getZpubFromMnemonic(faucetMnemonic, 'password', 'testnet');

  if (apiConfigService.isTestMode) {
    let receivingAddress = await walletService.getReceivingAddress(faucetZpub, 'faucet');
    await dbService.addresses.findOneAndUpdate({
      address: receivingAddress
    }, {
      balance: 10000000000
    }, identity);

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
      customerHoldings: [{
        hashedEmail: getHash(customerEmail, apiConfigService.hashingAlgorithm),
        amount: 10000000
      }, {
        hashedEmail: getHash('customer-2@mail.com', apiConfigService.hashingAlgorithm),
        amount: 20000000
      }]
    });
  }

  return {
    submissionAddress: submission?.paymentAddress ?? null,
    customerEmail: customerEmail,
    exchangeName: exchangeName
  };
};
