import { BitcoinService } from '../crypto';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';
import { Bip84Account } from "../crypto/bip84-account";
import { exchangeMnemonic, registryMnemonic } from '../crypto/exchange-mnemonic';
import { ElectrumBitcoinService } from "./electrum-bitcoin-service";
import { ElectrumWsClient } from "./electrum-ws-client";
import { ApiConfigService } from "../api-config";

// jest.setTimeout(100000);

describe('electrum-bitcoin-service', () => {
  let service: ElectrumBitcoinService;
  const registryAddress1 = 'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u';
  const txid = '5f8f5a1eae91e168d1c8c8e98709435d9b8a1e4757f780091fadcb6870cbf517';
  let exchangeZpub: string;
  const url = 'ws://18.170.107.186:50010'

  afterAll(async () => {
    service.disconnect();
  })

  beforeEach(async () => {
    exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    service = await new ElectrumBitcoinService(Network.testnet, new Logger(), {
       electrumTestnetUrl: url
    } as ApiConfigService);
  });

  test('get p2pkh address balance', async () => {
    expect(await service.getAddressBalance('mi9hzMmCBQT7orsKhHtQHhmrJZ9HrXkRru')).toBe(1905138);
  });

  test('get bech32 address balance', async () => {
    expect(await service.getAddressBalance('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u')).toBe(11000);
  });

  test('get tx for address', async () => {
    const txs = await service.getTransactionsForAddress('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u');
    console.log(JSON.stringify(txs, null, 2))
    // expect(txs[0].txid).toBe(txid);
    // expect(txs[0].inputValue).toBe(976616);
  });

  test('get tx', async () => {
    // const txs = await service.getTransaction('88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef');
    const txs = await service.getTransaction(txid);
    console.log(JSON.stringify(txs, null, 2));
    // expect(txs[0].txid).toBe(txid);
    // expect(txs[0].inputValue).toBe(976616);
  });

  test('get exchange wallet balance', async () => {
    const zpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    const timerId = 'exchange wallet balance';
    console.time(timerId)
    const walletBalance = await service.getWalletBalance(zpub);
    console.timeEnd(timerId)
    expect(walletBalance).toBe(1984074);
  });

  test('get registry wallet balance', async () => {
    const zpub = Bip84Account.zpubFromMnemonic(registryMnemonic);
    const timerId = 'registry wallet balance';
    console.time(timerId)
    const walletBalance = await service.getWalletBalance(zpub);
    console.timeEnd(timerId)
    expect(walletBalance).toBe(464801);
  });

});
