import { Bip84Utils, oldTestnetExchangeZprv } from '../crypto';
import { TestNode } from '../testing';
import { FundingAddressStatus } from '../types/funding-address.type';

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

    const valid = node.fundingAddressService.validateSignatures([signedAddress]);
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

  test('delete address', async () => {
    const exchange = await node.db.exchanges.findOne({});

    const address = await node.db.fundingAddresses.findOne({
      exchangeId: exchange._id,
      status: FundingAddressStatus.ACTIVE
    })

    const user = await node.db.users.findOne({
      exchangeId: exchange._id
    });

    await node.fundingAddressService.deleteAddress(user, address.address);

    const updatedAddress = await node.db.fundingAddresses.get(address._id)
    expect(updatedAddress.status).toBe(FundingAddressStatus.CANCELLED);

    const updatedExchange = await node.db.exchanges.get(exchange._id);
    expect(updatedExchange.currentFunds).toBe(exchange.currentFunds - address.balance);
  })

});
