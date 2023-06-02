import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';
import { Bip84Account } from "../crypto/bip84-account";
import { exchangeMnemonic, registryMnemonic, testnetExchangeZpub } from '../crypto/exchange-mnemonic';
import { ElectrumBitcoinService } from "./electrum-bitcoin-service";
import { ApiConfigService } from "../api-config";
import { isAddressFromWallet } from "../crypto/is-address-from-wallet";

jest.setTimeout(1000000);

describe('electrum-bitcoin-service', () => {
  let service: ElectrumBitcoinService;
  const registryAddress1 = 'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u';
  const txid = '5f8f5a1eae91e168d1c8c8e98709435d9b8a1e4757f780091fadcb6870cbf517';
  let exchangeZpub: string;
  const url = 'ws://18.170.107.186:50010'

  afterAll(async () => {
    // service.disconnect();
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
    expect(await service.getAddressBalance('tb1qurge6erkrqd4l9ca2uvgkgjddz0smrq5nhg72u')).toBe(112000);
  });

  test('get tx for address', async () => {
    const submissionAddress = 'tb1qx796t92zpc7hnnhaw3umc73m0mzryrhqquxl80';
    const txs = await service.getTransactionsForAddress(submissionAddress);
    console.log(JSON.stringify(txs, null, 2))
    // expect(txs[0].txid).toBe(txid);
    // expect(txs[0].inputValue).toBe(976616);
  });

  test('get tx', async () => {
    // const txs = await service.getTransaction('88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef');
    const id = '70e275a0a517e39a9e1a798e1d931d8b4e7b2cb74c61d6a0687652d3c63d1be5'
    const txs = await service.getTransaction(id);
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
    expect(walletBalance).toBe(1982874);
  });

  test('get registry wallet balance', async () => {
    const zpub = Bip84Account.zpubFromMnemonic(registryMnemonic);
    const timerId = 'registry wallet balance';
    console.time(timerId)
    const walletBalance = await service.getWalletBalance(zpub);
    console.timeEnd(timerId)
    expect(walletBalance).toBe(465501);
  });

  test('get previous output addresses', async () => {
    const outputAddress = await service.getPreviousOutputAddress('tb1q5zlt2lmgzkzd2nju566x54u7lg84ec9fmf7yac')
    console.log('is address from wallet:', outputAddress[0].address, ' ', isAddressFromWallet(outputAddress[0].address, exchangeZpub));
  })

  test('is address from wallet', async () => {
    const changeAddress = 'tb1qf5jvyjauu4qcxy76j4lq3hlxtelgad9kfwycw6';
    console.log('is address from wallet:', changeAddress, ' ', isAddressFromWallet(changeAddress, testnetExchangeZpub));
  })

  test('list addresses from exchange wallet', async () => {
    const bip84Account = new Bip84Account(testnetExchangeZpub);
    for (let i = 0; i < 100; i++) {
      const address = bip84Account.getAddress(i)
      console.log(i, ' = ', address, isAddressFromWallet(address, testnetExchangeZpub));
    }

    for (let i = 0; i < 100; i++) {
      const change = bip84Account.getAddress(i, true)
      console.log(i, ' = ', change, isAddressFromWallet(change, testnetExchangeZpub))
    }

  })

});
