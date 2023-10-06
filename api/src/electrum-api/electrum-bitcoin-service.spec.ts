import { TestLoggerService } from '../utils/logging';
import { Network } from '@bcr/types';
import { Bip84Utils } from '../crypto/bip84-utils';
import {
  exchangeMnemonic,
  oldTestnetExchangeZpub,
  registryMnemonic,
  simonsTestnetWallet,
  testnetRegistryZpub
} from '../crypto/exchange-mnemonic';
import { ElectrumBitcoinService } from './electrum-bitcoin-service';
import { ApiConfigService } from '../api-config';
import { isAddressFromWallet } from '../crypto/is-address-from-wallet';

jest.setTimeout(100000);

describe('electrum-bitcoin-service', () => {
  let service: ElectrumBitcoinService;
  const url = 'ws://18.170.107.186:50010';

  afterAll(async () => {
    service.disconnect();
  });

  beforeEach(() => {
    service = new ElectrumBitcoinService(Network.testnet, new TestLoggerService(), {
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
    const zpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic, Network.testnet, 'password');
    const timerId = 'exchange wallet balance';
    console.time(timerId);
    const walletBalance = await service.getWalletBalance(zpub);
    console.timeEnd(timerId);
    expect(walletBalance).toBe(1879800);
  });

  test('get registry wallet balance', async () => {
    const zpub = Bip84Utils.zpubFromMnemonic(registryMnemonic, Network.testnet, 'password');
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
    expect(balance).toBe(36800);
  });

});
