import { BitcoinService } from '../crypto';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';
import { Bip84Account } from "../crypto/bip84-account";
import { exchangeMnemonic } from "../crypto/exchange-mnemonic";
import { ElectrumBitcoinService } from "./electrum-bitcoin-service";
import { ElectrumWsClient } from "./electrum-ws-client";

// jest.setTimeout(100000);

describe('electrum-bitcoin-service', () => {
  let service: BitcoinService;
  const registryAddress1 = 'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u';
  const txid = '5f8f5a1eae91e168d1c8c8e98709435d9b8a1e4757f780091fadcb6870cbf517';
  let exchangeZpub: string;
  let client: ElectrumWsClient;
  const url = 'ws://18.170.107.186:50010'

  beforeAll(async () => {
    client = new ElectrumWsClient(url)
    await client.connect();
  })

  afterAll(async () => {
    client.disconnect();
  })

  beforeEach(async () => {
    exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
    service = await new ElectrumBitcoinService(Network.testnet, new Logger(), client);
  });

  test('get p2pkh address balance', async () => {
    expect(await service.getAddressBalance('mi9hzMmCBQT7orsKhHtQHhmrJZ9HrXkRru')).toBe(1905138);
  });

  test('get bech32 address balance', async () => {
    expect(await service.getAddressBalance('tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u')).toBe(11000);
  });

  test('get tx input balance', async () => {
    const txs = await service.getTransactionsForAddress(registryAddress1);
    expect(txs[0].txid).toBe(txid);
    expect(txs[0].inputValue).toBe(976616);
  });

  test('get test exchange wallet balance', async () => {
    const walletBalance = await service.getWalletBalance(exchangeZpub);
    expect(walletBalance).toBe(2018718);
  });
});
