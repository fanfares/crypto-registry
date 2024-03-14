import { FundingAddressService } from './funding-address.service';
import { Bip84Utils, oldTestnetExchangeZprv } from '../crypto';
import { TestNode } from '../testing';

describe('funding-address-service', () => {
  let node: TestNode;

  beforeAll(async () => {
    node = await TestNode.createTestNode(1);
  });

  beforeEach(async () => {
    await node.reset({
      numberOfExchanges: 2,
      numberOfFundingSubmissions: 2,
      numberOfFundingAddresses: 5
    });
  });

  afterAll(async () => {
    await node.destroy();
  });

  test('validate addresses', async () => {
    const bip84Utils = Bip84Utils.fromExtendedKey(oldTestnetExchangeZprv);
    const message = 'Some Message';
    const signedAddress = bip84Utils.sign(108, true, message);

    const address = bip84Utils.getAddress(108, true);
    expect(address).toBe('tb1qp4qsnlsg622ygpgcvn9q8lz52he53wdta5lg3q');
    expect(signedAddress.address).toBe(address);

    const service = new FundingAddressService(null, null, null, null, null);
    const valid = service.validateSignatures([signedAddress]);
    expect(valid).toBe(true);
  });

  test('query', async () => {
    const user = await node.db.users.findOne({
      exchangeId: {$ne: null}
    });

    let results = await node.fundingAddressService.query(user, {
      exchangeId: user.exchangeId,
      page: 1,
      pageSize: 2
    });
    expect(results.addresses.length).toBe(2);
    expect(results.total).toBe(10);

    results = await node.fundingAddressService.query(user, {
      exchangeId: user.exchangeId,
      page: 2,
      pageSize: 2
    });
    expect(results.addresses.length).toBe(2);
    expect(results.total).toBe(10);
  });

});
