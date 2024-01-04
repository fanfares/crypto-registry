import { RegisteredAddressService } from './registered-address.service';
import { Bip84Utils } from '../crypto/bip84-utils';
import { oldTestnetExchangeZprv } from '../crypto/exchange-mnemonic';
import { CreateRegisteredAddressDto } from '@bcr/types';

describe('registered-address-service', () => {

  test('address verification', async () => {
    const bip84Utils = Bip84Utils.fromExtendedKey(oldTestnetExchangeZprv);
    const message = 'I assert that, as of 13 Dec 2023, the exchange owns the referenced bitcoin on behalf of the customers specified';
    const signedAddress = bip84Utils.sign(108, true, message);

    const address = bip84Utils.getAddress(108, true);
    expect(address).toBe('tb1qp4qsnlsg622ygpgcvn9q8lz52he53wdta5lg3q');
    expect(signedAddress.address).toBe(address);

    const submissionWallets: CreateRegisteredAddressDto[] = [{
      address: signedAddress.address,
      signature: signedAddress.signature
    }];

    const service = new RegisteredAddressService( null, null, null, null);

    const valid = service.validateSignatures(submissionWallets, message);
    expect(valid).toBe(true);
  });
});
