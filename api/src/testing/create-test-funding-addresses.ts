import { DbService } from '../db/db.service';
import { FundingAddressBase, FundingSubmissionBase, FundingSubmissionRecord, Network } from '@bcr/types';
import { BulkUpdate } from '../db/db-api.types';
import { Bip84Utils, exchangeMnemonic } from '../crypto';
import { FundingAddressStatus } from '../types/funding-address.type';
import { BitcoinService } from '../bitcoin-service';

export async function createTestFundingAddresses(
  db: DbService,
  bitcoinService: BitcoinService,
  numberOfFundingAddresses: number) {

  const submissions = await db.fundingSubmissions.find({})
  const wallet = Bip84Utils.fromMnemonic(exchangeMnemonic, Network.testnet, 'vpub');
  const blockHash = await bitcoinService.getLatestBlock();

  const addresses: FundingAddressBase[] = [];
  const submissionUpdates: BulkUpdate<FundingSubmissionBase>[] = []
  for (const submission of submissions) {
    let submissionBalance = 0;
    for (let i = 0; i < numberOfFundingAddresses; i++) {
      addresses.push({
        address: wallet.getAddress(i, false),
        exchangeId: submission.exchangeId,
        status: FundingAddressStatus.ACTIVE,
        fundingSubmissionId: submission._id,
        message: blockHash,
        network: Network.testnet,
        balance: 10000 + (i * 1000),
        signature: wallet.sign(i, false, blockHash).signature
      })
    }
    submissionUpdates.push({
      id: submission._id,
      modifier: {
        submissionFunds: submissionBalance
      }
    })
  }

  if ( submissionUpdates.length ) {
    await db.fundingSubmissions.bulkUpdate(submissionUpdates);
  }

  if ( addresses.length ) {
    await db.fundingAddresses.insertMany(addresses);
  }

}
