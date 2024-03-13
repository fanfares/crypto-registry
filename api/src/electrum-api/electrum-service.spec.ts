import { TestLoggerService } from '../utils/logging';
import { Network } from '@bcr/types';
import {
  Bip84Utils,
  exchangeMnemonic,
  isAddressFromWallet,
  oldTestnetExchangeZpub,
  registryMnemonic,
  simonsTestnetWallet,
  testnetRegistryZpub
} from '../crypto';
import { ElectrumService } from './electrum-service';
import { ApiConfigService } from '../api-config';

jest.setTimeout(100000);

describe('electrum-bitcoin-service', () => {
  let service: ElectrumService;
  const url = 'ws://18.170.107.186:50010';

  afterAll(async () => {
    service.disconnect();
  });

  beforeEach(() => {
    service = new ElectrumService(Network.testnet, new TestLoggerService(), {
      electrumTestnetUrl: url
    } as ApiConfigService);
  });

  test('get p2pkh address balance', async () => {
    expect(await service.getAddressBalance('mi9hzMmCBQT7orsKhHtQHhmrJZ9HrXkRru')).toBe(1905138);
  });

  test('get bech32 address balance', async () => {
    expect(await service.getAddressBalance('tb1qurge6erkrqd4l9ca2uvgkgjddz0smrq5nhg72u')).toBe(112000);
  });

  test('get tx for address', async () => {
    const submissionAddress = 'tb1qx796t92zpc7hnnhaw3umc73m0mzryrhqquxl80';
    const txs = await service.getTransactionsForAddress(submissionAddress);
    expect(txs.length).toBe(2);
    const correctTx = txs.find(t => t.txid === 'f98308d8d25002e8e6a8952acbe9efbd3282566f3171d3ba7bd1c59dc12b2a5f');
    expect(correctTx).toBeDefined();

    const wrongSenderTx = txs.find(t => t.txid === 'de73a65b0007e46804d788cdb9d85ff3720a0e7b95a009fdade747ee04705a1c');
    expect(wrongSenderTx).toBeDefined();
  });

  test('get tx', async () => {
    const txid = 'f98308d8d25002e8e6a8952acbe9efbd3282566f3171d3ba7bd1c59dc12b2a5f';
    const tx = await service.getTransaction(txid);
    expect(tx.txid).toBe(txid);
    const destOutput = tx.outputs.find(o => o.address === 'tb1qx796t92zpc7hnnhaw3umc73m0mzryrhqquxl80');
    expect(destOutput.value).toBe(1000);
    const changeOutput = tx.outputs.find(o => o.address === 'tb1q37chevcm2ksex9m5hm0q8zgu7cqherf7f9jswc');
    expect(changeOutput.value).toBe(800);
  });

  test('get exchange wallet balance', async () => {
    const zpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub' );
    const timerId = 'exchange wallet balance';
    console.time(timerId);
    const walletBalance = await service.getWalletBalance(zpub);
    console.timeEnd(timerId);
    expect(walletBalance).toBe(778000);
  });

  test('get simons address balance tb1qdt4pcjqtpe7kjwhjp3g4phxy5s8a50u34fmmw8', async () => {
    expect(await service.getAddressBalance('tb1qdt4pcjqtpe7kjwhjp3g4phxy5s8a50u34fmmw8')).toBe(10000);
  });

  test('get registry wallet balance', async () => {
    const zpub = Bip84Utils.extendedPublicKeyFromMnemonic(registryMnemonic, Network.testnet, 'vpub', 'password');
    const timerId = 'registry wallet balance';
    console.time(timerId);
    const walletBalance = await service.getWalletBalance(zpub);
    console.timeEnd(timerId);
    expect(walletBalance).toBe(488501);
  });

  test('is address from registry wallet', async () => {
    const destAddress = 'tb1qx796t92zpc7hnnhaw3umc73m0mzryrhqquxl80';
    expect(isAddressFromWallet(destAddress, testnetRegistryZpub)).toBe(true);
  });

  test('is change address from exchange wallet', async () => {
    const changeAddress = 'tb1q37chevcm2ksex9m5hm0q8zgu7cqherf7f9jswc';
    expect(isAddressFromWallet(changeAddress, oldTestnetExchangeZpub)).toBe(true);
  });

  /*
    Exchange => Registry Tx on the 1/6/2023
    - txid: f98308d8d25002e8e6a8952acbe9efbd3282566f3171d3ba7bd1c59dc12b2a5f
    - outputs:
      - dest address: tb1qx796t92zpc7hnnhaw3umc73m0mzryrhqquxl80, value 1000
      - change address: tb1q37chevcm2ksex9m5hm0q8zgu7cqherf7f9jswc, value 800
    - input address: unknown
   */
  test('get output value for exchange zpub', async () => {
    const result = await service.getAmountSentBySender('tb1qx796t92zpc7hnnhaw3umc73m0mzryrhqquxl80', oldTestnetExchangeZpub);
    expect(result.valueOfOutputFromSender).toBe(1000);
    expect(result.senderMismatch).toBe(false);
    expect(result.noTransactions).toBe(false);
  });

  test('simons testnet wallet', async () => {
    const balance = await service.getWalletBalance(simonsTestnetWallet);
    expect(balance).toBe(34400);
  });

});
