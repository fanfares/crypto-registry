import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { NodeService } from '../node';
import { Network, SyncDataMessage, SyncRequestMessage } from '@bcr/types';
import { candidateIsMissingData } from './candidate-is-missing-data';
import { ObjectId } from 'mongodb';
import { MessageSenderService } from '../network/message-sender.service';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';

@Injectable()
export class SyncService {

  constructor(
    private db: DbService,
    private messageSenderService: MessageSenderService,
    private nodeService: NodeService,
    private logger: Logger,
    private apiConfigService: ApiConfigService,
    private walletService: WalletService
  ) {
  }

  async execute() {
    this.logger.log('broadcast synchronisation ping');
    let thisNodeSyncRequest = await this.nodeService.getSyncRequest();
    await this.nodeService.checkThisNodeRecordInSync(thisNodeSyncRequest);
    await this.nodeService.emitNodes();
    await this.messageSenderService.broadcastPing(thisNodeSyncRequest);

    const nodes = await this.db.nodes.find({
      unresponsive: false
    });

    for (const node of nodes) {
      thisNodeSyncRequest = await this.nodeService.getSyncRequest();
      if ( candidateIsMissingData(node, thisNodeSyncRequest, this.logger)) {
        this.logger.warn(`${thisNodeSyncRequest.address} is missing data compared to ${node.address}`, {
          syncRequest: thisNodeSyncRequest,
          nodeSyncRequest: node
        });
        await this.messageSenderService.sendSyncRequestMessage(node.address, thisNodeSyncRequest);
      }
    }
  }

  async processPing(senderAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.log('processing ping from ' + senderAddress);
    await this.nodeService.updateStatus(false, senderAddress, syncRequest);
  }


  async startUp() {
    this.logger.debug('sync service initialising');

    try {
      this.logger.log('broadcast startup ping');
      await this.nodeService.updateLeader();
      const syncRequest = await this.nodeService.getSyncRequest();
      await this.nodeService.updateStatus(false, this.nodeService.getThisNodeAddress(), syncRequest);

      // // This ensures that our responsive flags in the node table are up-to-date.
      await this.messageSenderService.broadcastPing(syncRequest, true);

    } catch (err) {
      this.logger.error('Failed to initialise Sync Service', {err});
    }
  }

  async processSyncRequest(requestingAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.log('processing sync request from ' + requestingAddress);

    const thisNode = await this.nodeService.getThisNode();
    if (!thisNode.isLeader) {
      this.logger.warn('received sync request as non-leader');
      return;
    }

    let submissionsFilter = {};
    if (syncRequest.latestSubmissionId) {
      submissionsFilter = {
        _id: {$gt: new ObjectId(syncRequest.latestSubmissionId)}
      };
    }
    const submissions = await this.db.submissions.find(submissionsFilter);

    const customerHoldings = await this.db.customerHoldings.find({
      submissionId: {$in: submissions.map(s => s._id)}
    });

    const submissionConfirmations = await this.db.submissionConfirmations.find({
      submissionId: {$in: submissions.map(s => s._id)}
    });

    let verificationFilter = {};
    if (syncRequest.latestVerificationId) {
      verificationFilter = {
        _id: {$gt: new ObjectId(syncRequest.latestVerificationId)}
      };
    }
    const verificationsToReturn = await this.db.verifications.find(verificationFilter);

    // Wallet History
    const testnetWalletHistoryCount = await this.walletService.getAddressCount(this.apiConfigService.getRegistryZpub(Network.testnet))
    const mainnetWalletHistoryCount = await this.walletService.getAddressCount(this.apiConfigService.getRegistryZpub(Network.testnet))

    const resetWalletHistory = testnetWalletHistoryCount !== syncRequest.testnetRegistryWalletAddressCount ||
      mainnetWalletHistoryCount !== syncRequest.mainnetRegistryWalletAddressCount;

    setTimeout(async () => {
      await this.messageSenderService.sendSyncDataMessage(requestingAddress, {
        submissions: submissions,
        verifications: verificationsToReturn,
        customerHoldings: customerHoldings,
        submissionConfirmations: submissionConfirmations,
        resetWalletHistory: resetWalletHistory
      });
    }, 1000);
  }

  async processSyncData(senderAddress: string, data: SyncDataMessage) {
    this.logger.log('receiving sync data', {
      sender: senderAddress,
      verifications: data.verifications.length,
      submissions: data.submissions.length,
      customerHoldings: data.customerHoldings.length,
      submissionConfirmations: data.submissionConfirmations.length,
      resetWalletHistory: data.resetWalletHistory
    });

    if (data.verifications.length > 0) {
      console.log('inserting verifications');
      await this.db.verifications.insertManyRecords(data.verifications);
    }

    if (data.submissions.length > 0) {
      await this.db.submissions.insertManyRecords(data.submissions);
      await this.db.customerHoldings.insertManyRecords(data.customerHoldings);
      await this.db.submissionConfirmations.insertManyRecords(data.submissionConfirmations);

      const syncRequest = await this.nodeService.getSyncRequest();
      const thisNode = await this.nodeService.getThisNode();
      await this.nodeService.updateStatus(false, thisNode.address, syncRequest);
    }

    if (data.resetWalletHistory) {
      console.log('reset wallet address history');
      await this.nodeService.resetWalletHistory()
    }

    await this.nodeService.emitNodes();
  }
}
