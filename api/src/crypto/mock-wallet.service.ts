import { MockAddressDbService } from './mock-address-db.service';
import { UserIdentity } from '@bcr/types';
import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { generateAddress } from './generate-address';
import { WalletService } from './wallet.service';

@Injectable()
export class MockWalletService extends WalletService {
  private logger = new Logger(MockWalletService.name)

  constructor(
    private addressDbService: MockAddressDbService,
  ) {
    super();
  }

  async sendFunds(
    senderZpub: string,
    toAddress: string,
    amount: number) {
    this.logger.log('send funds', { senderZpub, toAddress, amount });

    const identity: UserIdentity = { type: 'test' };
    if (amount < minimumBitcoinPaymentInSatoshi) {
      throw new BadRequestException('Amount is lower than minimum bitcoin amount');
    }

    const senderUnspent = await this.addressDbService.find({
      zpub: senderZpub,
      unspent: true
    });

    const senderBalance = senderUnspent.reduce((t, tx) => t + tx.balance, 0);

    if (senderBalance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    let spentAmount = 0;
    for (const unspent of senderUnspent)
      if (spentAmount < amount) {
        await this.addressDbService.update(unspent._id, {
          unspent: false
        }, identity);
        spentAmount += unspent.balance;
      } else {
        break;
      }

    // generate change address
    const existingChangeAddresses = await this.addressDbService.count({
      zpub: senderZpub,
      forChange: true
    });

    const changeAddress = generateAddress(senderZpub, existingChangeAddresses, true);
    await this.addressDbService.insert({
      walletName: senderUnspent[0].walletName,
      forChange: true,
      balance: spentAmount - amount,
      address: changeAddress,
      zpub: senderZpub,
      unspent: true
    }, identity);

    const toAddressRecord = await this.addressDbService.findOne({
      address: toAddress
    });

    if (toAddressRecord) {
      await this.addressDbService.update(toAddressRecord._id, {
        balance: toAddressRecord.balance + amount
      }, identity);
    } else {
      throw new BadRequestException('Receiving address does not exist');
    }

  }

  async getReceivingAddress(
    receiverZpub: string,
    receiverName: string
  ): Promise<string> {
    const existingReceiverAddresses = await this.addressDbService.count({
      zpub: receiverZpub,
      forChange: false
    });
    const receivingAddress = generateAddress(receiverZpub, existingReceiverAddresses, false);
    await this.addressDbService.insert({
      walletName: receiverName,
      forChange: false,
      balance: 0,
      address: receivingAddress,
      zpub: receiverZpub,
      unspent: true
    }, { type: 'test' });
    return receivingAddress;
  }
}
