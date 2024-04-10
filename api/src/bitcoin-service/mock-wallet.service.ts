import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DbService } from '../db/db.service';
import { Bip84Utils, exchangeMnemonic } from '../crypto';
import { Network } from '@bcr/types';

@Injectable()
export class MockWalletService extends WalletService {

  private logger= new Logger(MockWalletService.name);

  constructor(
    private db: DbService,
  ) {
    super();
  }

  async reset() {
    await this.db.mockAddresses.deleteMany({});
    await this.db.mockTransactions.deleteMany({});
    const exchangeZpub = Bip84Utils.extendedPublicKeyFromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');
    const addressGenerator = Bip84Utils.fromExtendedKey(exchangeZpub);
    await this.sendFunds(addressGenerator.getAddress(0, false), 30000000);
  }

  async sendFunds(
    toAddress: string,
    amount: number
  ) {
    this.logger.log('send funds', {toAddress, amount});

    if (amount < minimumBitcoinPaymentInSatoshi) {
      throw new BadRequestException('Amount is lower than minimum bitcoin amount');
    }

    const network = Bip84Utils.getNetworkForAddress(toAddress);

    const toAddressRecord = await this.db.mockAddresses.findOne({
      address: toAddress
    });

    if (toAddressRecord) {
      await this.db.mockAddresses.update(toAddressRecord._id, {
        balance: toAddressRecord.balance
      });
    } else {
      await this.db.mockAddresses.insert({
        balance: amount,
        address: toAddress,
        network: network
      });
    }
  }
}
