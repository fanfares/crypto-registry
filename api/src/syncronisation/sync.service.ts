import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { NodeService } from '../node';
import { SyncDataMessage, SyncRequestMessage } from '@bcr/types';
import { candidateIsMissingData } from './candidate-is-missing-data';
import { MessageSenderService } from '../network/message-sender.service';
/* eslint-disable */
@Injectable()
export class SyncService {
  private logger= new Logger(SyncService.name);

  isWorking = false;

  constructor(
    private db: DbService,
    private messageSenderService: MessageSenderService,
    private nodeService: NodeService,
  ) {
  }

  async execute() {
    if (this.isWorking) {
      this.logger.log('sync-service isWorking flag set - skip execution');
      return;
    }
    this.isWorking = true;

    this.logger.log('broadcast synchronisation ping');
    let thisNodeSyncRequest = await this.nodeService.getSyncRequest();
    await this.nodeService.checkThisNodeRecordInSync(thisNodeSyncRequest);
    await this.messageSenderService.broadcastPing(thisNodeSyncRequest);

    const nodes = await this.db.nodes.find({
      unresponsive: false
    });

    for (const node of nodes) {
      thisNodeSyncRequest = await this.nodeService.getSyncRequest();
      if (candidateIsMissingData(node, thisNodeSyncRequest, this.logger)) {
        this.logger.warn(`${thisNodeSyncRequest.address} is missing data compared to ${node.address}`, {
          syncRequest: thisNodeSyncRequest,
          nodeSyncRequest: node
        });
        await this.messageSenderService.sendSyncRequestMessage(node.address, thisNodeSyncRequest);
      }
    }
    this.isWorking = false;
  }

  async processPing(senderAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.log('processing ping from ' + senderAddress);
    await this.nodeService.updateStatus(false, senderAddress, syncRequest);
  }

  async processSyncRequest(requestingAddress: string, syncRequest: SyncRequestMessage) {
    // if (this.isWorking) {
    //   this.logger.log('sync-service isWorking flag set - skip processing sync request');
    //   return;
    // }
    // this.isWorking = true;
    //
    // this.logger.log('processing sync request from ' + requestingAddress);
    //
    // let submissionsFilter = {};
    // if (syncRequest.latestSubmissionId) {
    //   submissionsFilter = {
    //     _id: {$gt: new ObjectId(syncRequest.latestSubmissionId)},
    //     isCurrent: true,
    //     status: SubmissionStatus.CONFIRMED
    //   };
    // }
    //
    // const submissions = await this.db.submissions.find(submissionsFilter);
    //
    // const customerHoldings = await this.db.holdings.find({
    //   submissionId: {$in: submissions.map(s => s._id)}
    // });
    //
    // const submissionConfirmations = await this.db.submissionConfirmations.find({
    //   submissionId: {$in: submissions.map(s => s._id)}
    // });
    //
    // let verificationFilter = {};
    // if (syncRequest.latestVerificationId) {
    //   verificationFilter = {
    //     _id: {$gt: new ObjectId(syncRequest.latestVerificationId)}
    //   };
    // }
    // const verificationsToReturn = await this.db.verifications.find(verificationFilter);
    //
    // setTimeout(async () => {
    //   await this.messageSenderService.sendSyncDataMessage(requestingAddress, {
    //     submissions: submissions,
    //     verifications: verificationsToReturn,
    //     customerHoldings: customerHoldings,
    //     submissionConfirmations: submissionConfirmations
    //   });
    // }, 1000);
    //
    // this.isWorking = false;
  }

  async processSyncData(senderAddress: string, data: SyncDataMessage) {
    // if (this.isWorking) {
    //   this.logger.log('sync-service isWorking flag set - skip processing sync data');
    //   return;
    // }
    //
    // this.isWorking = true;
    //
    // this.logger.log('receiving sync data', {
    //   sender: senderAddress,
    //   verifications: data.verifications.length,
    //   submissions: data.submissions.length,
    //   customerHoldings: data.customerHoldings.length,
    //   submissionConfirmations: data.submissionConfirmations.length
    // });
    //
    // if (data.verifications.length > 0) {
    //   console.log('inserting verifications');
    //   await this.db.verifications.insertManyRecords(data.verifications);
    // }
    //
    // if (data.submissions.length > 0) {
    //   await this.db.submissions.insertManyRecords(data.submissions);
    //   await this.db.holdings.insertManyRecords(data.customerHoldings);
    //   await this.db.submissionConfirmations.insertManyRecords(data.submissionConfirmations);
    //
    //   const syncRequest = await this.nodeService.getSyncRequest();
    //   const thisNode = await this.nodeService.getThisNode();
    //   await this.nodeService.updateStatus(false, thisNode.address, syncRequest);
    // }
    //
    // this.isWorking = false;
    //
    // await this.nodeService.emitNodes();
  }
}
