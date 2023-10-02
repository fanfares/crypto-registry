import { SigningService } from './signing.service';
import { testnetExchangeZprv, testnetRegistryZpub } from '../crypto/exchange-mnemonic';

describe('signing-service', () => {

  test('sign and verify', () => {
    const signer = new SigningService();
    const message = 'hello world';
    const signature = signer.sign(testnetExchangeZprv, message);
    const verified = signer.verify(testnetRegistryZpub, message, signature);
    expect(verified).toBe(true);
  });
});
