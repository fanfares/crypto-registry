import { FundingAddressService } from './funding-address.service';
import { Bip84Utils, oldTestnetExchangeZprv } from '../crypto';
import { TestNetwork, TestNode } from '../testing';

describe('funding-address-service', () => {
  let node: TestNode;

  beforeAll(async () => {
    node = await TestNode.createTestNode(1);
  });

  afterEach(async () => {
    await node.reset();
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

  test('cannot validate signatures', ( )=> {
    // todo
  })

  test('throws exception....', () => {
    // todo
  })

  test('validate network of funding addresses', async () => {
    // await node.createTestFundingSubmission(true);
    //
    //
    // const service = new FundingAddressService(null, null, null, null, null);
  })

  test('cancel existing active addresses', () => {

  })

});
