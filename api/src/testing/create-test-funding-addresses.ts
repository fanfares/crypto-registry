import { DbService } from '../db/db.service';
import { FundingAddressBase, Network } from '@bcr/types';
import { Bip84Utils, exchangeMnemonic } from '../crypto';
import { FundingAddressStatus } from '../types/funding-address.type';
import { BitcoinService } from '../bitcoin-service';

export async function createTestFundingAddresses(
  db: DbService,
  bitcoinService: BitcoinService,
  numberOfFundingAddresses: number) {

  const exchanges = await db.exchanges.find({});
  const wallet = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');
  const blockHash = await bitcoinService.getLatestBlock();
  const validFrom = new Date();

  const addresses: FundingAddressBase[] = [];
  for (const exchange of exchanges) {
    for (let i = 0; i < numberOfFundingAddresses; i++) {
      addresses.push({
        address: wallet.getAddress( numberOfFundingAddresses + i, false),
        exchangeId: exchange._id,
        status: FundingAddressStatus.ACTIVE,
        message: blockHash,
        network: Network.testnet,
        balance: 10000 + (i * 1000),
        signature: wallet.sign(i, false, blockHash).signature,
        signatureDate: validFrom,
        balanceDate: validFrom,
        retryCount: 0
      });
    }
  }

  if (addresses.length) {
    await db.fundingAddresses.insertMany(addresses);
  }
}
