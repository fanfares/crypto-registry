import {minimumBitcoinPaymentInSatoshi} from '../utils';
import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {generateAddress} from './generate-address';
import {WalletService} from './wallet.service';
import {v4 as uuidv4} from 'uuid';
import {TransactionInput} from './bitcoin.service';
import {DbService} from '../db/db.service';
import { Network } from '@bcr/types';

@Injectable()
export class MockWalletService extends WalletService {

  private static walletService: WalletService;

  static getWalletService(dbService: DbService) {
    if (!MockWalletService.walletService) {
      MockWalletService.walletService = new MockWalletService(dbService)
    }
    return MockWalletService.walletService
  }

  private logger = new Logger(MockWalletService.name);

  private constructor(
    private db: DbService
  ) {
    super();
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
    receiverName: string
  ): Promise<string> {
    const existingReceiverAddresses = await this.db.mockAddresses.count({
      zpub: receiverZpub,
      forChange: false
    });
    const receivingAddress = generateAddress(receiverZpub, existingReceiverAddresses, false);
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
    const address = await this.db.mockAddresses.findOne({
      address: receivingAddress
    })

    if ( address ) {
      this.logger.warn('receiving address already stored', {
        receivingAddress, receiverZpub
      })
      return;
    }

    await this.db.mockAddresses.insert({
      walletName: receiverName,
      forChange: false,
      balance: 0,
      address: receivingAddress,
      zpub: receiverZpub,
      unspent: true
    });
  }

  async isUsedAddress(receivingAddress: string): Promise<boolean> {
    const address = await this.db.mockAddresses.findOne({
      address: receivingAddress
    })
    return !!address
  }
}
