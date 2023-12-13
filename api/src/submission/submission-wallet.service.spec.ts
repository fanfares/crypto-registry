import { SubmissionWalletService } from './submission-wallet.service';
import { Bip84Utils } from '../crypto/bip84-utils';
import { oldTestnetExchangeZprv } from '../crypto/exchange-mnemonic';
import { SubmissionWallet } from '@bcr/types';

describe('submission-wallet-service', () => {

  test('address verification', async () => {
    const bip84Utils = Bip84Utils.fromExtendedKey(oldTestnetExchangeZprv);
    const message = 'I assert that, as of 13 Dec 2023, the exchange owns the referenced bitcoin on behalf of the customers specified';
    const signedAddress = bip84Utils.sign(108, true, message);

    const address = bip84Utils.getAddress(108, true);
    expect(address).toBe('tb1qp4qsnlsg622ygpgcvn9q8lz52he53wdta5lg3q');
    expect(signedAddress.address).toBe(address);

    const submissionWallets: SubmissionWallet[] = [{
      address: signedAddress.address,
      balance: 100,
      signature: signedAddress.signature
    }];

    const service = new SubmissionWalletService(null, null, null, null, null);

    const valid = service.validateSignatures(submissionWallets, message);
    expect(valid).toBe(true);
    console.log(submissionWallets[0].signature);
  });
});
