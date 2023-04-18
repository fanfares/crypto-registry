import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { generateAddress } from './generate-address';
import { WalletService } from './wallet.service';
import { v4 as uuidv4 } from 'uuid';
import { TransactionInput } from './bitcoin.service';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';
import { BitcoinWalletService } from "./bitcoin-wallet.service";
import { BitcoinServiceFactory } from "./bitcoin-service-factory";
import { getNetworkForZpub } from "./get-network-for-zpub";
import { Bip84Account } from "./bip84-account";
import { exchangeMnemonic, faucetMnemonic } from "./exchange-mnemonic";
import { ApiConfigService } from "../api-config";

@Injectable()
export class MockWalletService extends WalletService implements OnModuleInit {

  private static walletService: MockWalletService;
  private bitcoinWalletService: BitcoinWalletService;

  static getInstance(
    dbService: DbService,
    bitcoinServiceFactory: BitcoinServiceFactory,
    apiConfigService: ApiConfigService,
    logger: Logger
  ) {
    if (!MockWalletService.walletService) {
      MockWalletService.walletService = new MockWalletService(dbService, bitcoinServiceFactory, apiConfigService, logger);
    }
    return MockWalletService.walletService;
  }

  private constructor(
    private db: DbService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private apiConfigService: ApiConfigService,
    private logger: Logger
  ) {
    super();
    this.bitcoinWalletService = new BitcoinWalletService(db, bitcoinServiceFactory)
  }

  async onModuleInit() {
    if (this.apiConfigService.isTestMode || this.apiConfigService.bitcoinApi === 'mock') {
      const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
      const faucetZpub = Bip84Account.zpubFromMnemonic(faucetMnemonic);
      let receivingAddress = await this.getReceivingAddress(faucetZpub, 'faucet', Network.testnet);
      await this.db.mockAddresses.findOneAndUpdate({
        address: receivingAddress
      }, {
        balance: 10000000000
      });

      receivingAddress = await this.getReceivingAddress(exchangeZpub, 'exchange', Network.testnet);
      await this.sendFunds(faucetZpub, receivingAddress, 30000000);
    }
  }

  async sendFunds(
    senderZpub: string,
    toAddress: string,
    amount: number) {
    this.logger.log('send funds', {senderZpub, toAddress, amount});

    if (amount < minimumBitcoinPaymentInSatoshi) {
      throw new BadRequestException('Amount is lower than minimum bitcoin amount');
    }

    const senderUnspent = await this.db.mockAddresses.find({
      zpub: senderZpub,
      unspent: true
    });

    const senderBalance = senderUnspent.reduce((t, tx) => t + tx.balance, 0);

    if (senderBalance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    const txid = uuidv4();
    const inputs: TransactionInput[] = [];
    let spentAmount = 0;
    for (const unspent of senderUnspent)
      if (spentAmount < amount) {
        inputs.push({
          address: unspent.address,
          txid: txid,
          value: unspent.balance
        });
        await this.db.mockAddresses.update(unspent._id, {
          unspent: false
        });
        spentAmount += unspent.balance;
      } else {
        break;
      }

    // generate change address
    const existingChangeAddresses = await this.db.mockAddresses.count({
      zpub: senderZpub,
      forChange: true
    });

    const changeAddress = generateAddress(senderZpub, existingChangeAddresses, true);
    await this.db.mockAddresses.insert({
      walletName: senderUnspent[0].walletName,
      forChange: true,
      balance: spentAmount - amount,
      address: changeAddress,
      zpub: senderZpub,
      unspent: true
    });

    const toAddressRecord = await this.db.mockAddresses.findOne({
      address: toAddress
    });

    if (toAddressRecord) {
      await this.db.mockAddresses.update(toAddressRecord._id, {
        balance: toAddressRecord.balance + amount
      });
    } else {
      throw new BadRequestException('Receiving address does not exist');
    }

    await this.db.mockTransactions.insert({
      txid: txid,
      fee: 150,
      inputs: inputs,
      outputs: [{
        address: toAddress,
        value: amount
      }, {
        address: changeAddress,
        value: senderBalance - amount
      }],
      blockTime: new Date(),
      inputValue: amount
    });
  }

  async getReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network
  ): Promise<string> {
    const receivingAddress = await this.bitcoinWalletService.getReceivingAddress(receiverZpub, receiverName, network);
    await this.db.mockAddresses.insert({
      walletName: receiverName,
      forChange: false,
      balance: 0,
      address: receivingAddress,
      zpub: receiverZpub,
      unspent: true
    });
    return receivingAddress;
  }

  async storeReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network,
    receivingAddress: string
  ) {
    await this.bitcoinWalletService.storeReceivingAddress(receiverZpub, receiverName, network, receivingAddress)

    await this.db.mockAddresses.insert({
      walletName: receiverName,
      forChange: false,
      balance: 0,
      address: receivingAddress,
      zpub: receiverZpub,
      unspent: true
    });
  }

  async resetHistory(
    zpub: string,
  ): Promise<void> {
    const network = getNetworkForZpub(zpub)
    await this.bitcoinWalletService.resetHistory(zpub, false)
    const addresses = await this.db.walletAddresses.find({})
    for (const address of addresses) {
      await this.storeReceivingAddress(zpub, 'not required', network, address.address)
    }
  }

  async isUsedAddress(address: string): Promise<boolean> {
    return await this.bitcoinWalletService.isUsedAddress(address)
  }

  async getAddressCount(receiverZpub: string, network: Network): Promise<number> {
    return this.bitcoinWalletService.getAddressCount(receiverZpub, network);
  }


}
