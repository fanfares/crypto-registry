import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { v4 as uuidv4 } from 'uuid';
import { TransactionInput } from './bitcoin.service';
import { DbService } from '../db/db.service';
import { Bip84Utils } from './bip84-utils';
import { exchangeMnemonic, faucetMnemonic } from './exchange-mnemonic';
import { ApiConfigService } from '../api-config';
import { WalletAddress } from '../types/wallet-address-db.types';
import { getNetworkForZpub } from './get-network-for-zpub';
import { MockBitcoinService } from './mock-bitcoin.service';

@Injectable()
export class MockWalletService extends WalletService {

  mockBitcoinService: MockBitcoinService;

  constructor(
    private db: DbService,
    private apiConfigService: ApiConfigService,
    private logger: Logger
  ) {
    super();
    this.mockBitcoinService = new MockBitcoinService(db, logger);
  }

  async reset() {
    if (this.apiConfigService.bitcoinApi === 'mock') {
      const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic);
      const faucetZpub = Bip84Utils.zpubFromMnemonic(faucetMnemonic);
      const faucetReceivingAddress = await this.getReceivingAddress(faucetZpub);
      await this.db.mockAddresses.insert({
        zpub: faucetZpub,
        forChange: false,
        network: getNetworkForZpub(faucetZpub),
        index: 0,
        balance: 10000000000,
        address: faucetReceivingAddress.address,
        unspent: true
      });

      const exchangeReceivingAddress = await this.getReceivingAddress(exchangeZpub);
      await this.sendFunds(faucetZpub, exchangeReceivingAddress.address, 30000000);
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
          value: unspent.balance,
          outputIndex: 0
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

    const addressGenerator = this.mockBitcoinService.getAddressGenerator(senderZpub);
    const changeAddress = addressGenerator.getAddress(existingChangeAddresses, true);
    await this.db.mockAddresses.insert({
      forChange: true,
      network: getNetworkForZpub(senderZpub),
      index: existingChangeAddresses,
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
    receiverZpub: string
  ): Promise<WalletAddress> {
    const network = getNetworkForZpub(receiverZpub);
    const previousAddress = await this.db.mockAddresses.findOne({
      zpub: receiverZpub
    }, {
      sort: {
        index: 1
      }
    });

    const nextIndex = previousAddress ? previousAddress.index + 1 : 0;

    const addressGenerator = this.mockBitcoinService.getAddressGenerator(receiverZpub);
    const receivingAddress = addressGenerator.getAddress(nextIndex, false);

    await this.db.mockAddresses.insert({
      forChange: false,
      network: network,
      index: nextIndex,
      balance: 0,
      address: receivingAddress,
      zpub: receiverZpub,
      unspent: true
    });

    return {
      address: receivingAddress,
      index: nextIndex,
      zpub: receiverZpub,
      network: network
    };
  }

  async storeReceivingAddress(
    walletAddress: WalletAddress
  ) {
    await this.db.mockAddresses.insert({
      forChange: false,
      balance: 0,
      address: walletAddress.address,
      index: walletAddress.index,
      network: walletAddress.network,
      zpub: walletAddress.zpub,
      unspent: true
    });
  }

  async resetHistory(
    zpub: string
  ): Promise<void> {
    await this.db.mockAddresses.deleteMany({zpub});
  }

  async getAddressCount(receiverZpub: string): Promise<number> {
    return await this.db.mockAddresses.count({zpub: receiverZpub});
  }


}
