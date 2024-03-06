import { FundingAddressService } from './funding-address.service';
import { Bip84Utils, oldTestnetExchangeZprv } from '../crypto';
import { CreateRegisteredAddressDto } from '@bcr/types';

describe('funding-address-service', () => {

  test('validate addresses', async () => {
    const bip84Utils = Bip84Utils.fromExtendedKey(oldTestnetExchangeZprv);
    const message = 'Some Message';
    const signedAddress = bip84Utils.sign(108, true, message);

    const address = bip84Utils.getAddress(108, true);
    expect(address).toBe('tb1qp4qsnlsg622ygpgcvn9q8lz52he53wdta5lg3q');
    expect(signedAddress.address).toBe(address);

    const submissionWallets: CreateRegisteredAddressDto[] = [{
      address: signedAddress.address,
      signature: signedAddress.signature,
      message: message
    }];

    const service = new FundingAddressService(null, null, null, null, null);
    const valid = service.validateSignatures(submissionWallets, message);
    expect(valid).toBe(true);
  });
});
