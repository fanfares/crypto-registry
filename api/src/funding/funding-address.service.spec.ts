import { Bip84Utils, oldTestnetExchangeZprv } from '../crypto';
import { TestNode } from '../testing';
import { FundingAddressStatus } from '../types/funding-address.type';
import { UserRecord } from '@bcr/types';

describe('funding-address-service', () => {
  let node: TestNode;
  let user: UserRecord;

  beforeAll(async () => {
    node = await TestNode.createTestNode(1);
  });

  beforeEach(async () => {
    await node.reset({
      numberOfExchanges: 2,
      numberOfFundingAddresses: 5
    });
    user = await node.db.users.findOne({
      exchangeId: {$ne: null}
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

  test('default query', async () => {
    let results = await node.fundingAddressService.query(user, {
      exchangeId: user.exchangeId,
      page: 1,
      pageSize: 2
    });
    expect(results.addresses.length).toBe(2);
    expect(results.total).toBe(5); // todo - consider what the admin user should see.

    results = await node.fundingAddressService.query(user, {
      exchangeId: user.exchangeId,
      page: 2,
      pageSize: 2
    });
    expect(results.addresses.length).toBe(2);
    expect(results.total).toBe(5);
  });

  test('status query', async () => {

    const address = await node.db.fundingAddresses.findOne({
      exchangeId: user.exchangeId
    })

    await node.db.fundingAddresses.update(address._id, {
      status: FundingAddressStatus.FAILED
    });

    const results = await node.fundingAddressService.query(user, {
      status: FundingAddressStatus.FAILED,
      page: 1,
      pageSize: 2
    });
    expect(results.addresses.length).toBe(1);
    expect(results.total).toBe(5);
    expect(results.addresses[0]._id).toBe(address._id);
  });

  test('address name query', async () => {

    const address = await node.db.fundingAddresses.findOne({
      exchangeId: user.exchangeId
    })

    const results = await node.fundingAddressService.query(user, {
      address: address.address.substring(0, address.address.length - 2),
      page: 1,
      pageSize: 2
    });
    expect(results.addresses.length).toBe(1);
    expect(results.total).toBe(5);
    expect(results.addresses[0]._id).toBe(address._id);
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
    expect(updatedAddress).toBeUndefined();

    const updatedExchange = await node.db.exchanges.get(exchange._id);
    expect(updatedExchange.currentFunds).toBe(exchange.currentFunds - address.balance);
  });

  test('increment retry count', async () => {
    const exchange = await node.db.exchanges.findOne({});

    const address = await node.db.fundingAddresses.findOne({
      exchangeId: exchange._id,
    })

    await node.db.fundingAddresses.update(address._id, {
      status: FundingAddressStatus.PENDING
    })

    expect(address.retryCount).toBe(0);
    await node.fundingAddressService.handleProcessingFailure([address], 'Failed');
    let updatedAddress = await node.db.fundingAddresses.get(address._id)
    expect(updatedAddress.retryCount).toBe(1);
    await node.fundingAddressService.handleProcessingFailure([address], 'Failed');
    await node.fundingAddressService.handleProcessingFailure([address], 'Failed');
    updatedAddress = await node.db.fundingAddresses.get(address._id)
    expect(updatedAddress.retryCount).toBe(3);
    expect(updatedAddress.status).toBe(FundingAddressStatus.FAILED);
  });
});
