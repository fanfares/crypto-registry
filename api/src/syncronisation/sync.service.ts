import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { MessageSenderService } from '../network/message-sender.service';
import { NodeService } from '../node';
import { SyncDataMessage, SyncRequestMessage } from '@bcr/types';
import { Cron } from '@nestjs/schedule';
import { candidateIsMissingData } from './candidate-is-missing-data';

@Injectable()
export class SyncService implements OnModuleInit {

  constructor(
    private db: DbService,
    private messageSenderService: MessageSenderService,
    private nodeService: NodeService,
    private logger: Logger
  ) {
  }

  @Cron('30 * * * * *')
  async cronPing() {
    this.logger.log('broadcast synchronisation ping');
    const syncRequest = await this.nodeService.getSyncRequest();
    await this.nodeService.checkThisNodeRecordInSync(syncRequest);
    await this.messageSenderService.broadcastPing(syncRequest);
  }

  async processPing(senderAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.log(' processing ping from ' + senderAddress);
    await this.nodeService.updateStatus(false, senderAddress, syncRequest);

    // If this message came from the leader, then check for missing data.
    const thisNodeSyncRequest = await this.nodeService.getSyncRequest();
    const thisNode = await this.nodeService.getThisNode();

    if (thisNode.isStarting) {
      const leaderAddress = await this.nodeService.getLeaderAddress();
      if (leaderAddress === senderAddress || thisNode.isLeader) {
        if (candidateIsMissingData(syncRequest, thisNodeSyncRequest)) {
          this.logger.warn(`${thisNode.address} is missing data compared to ${senderAddress}`, {
            syncRequest,
            thisNodeSyncRequest
          });
          this.logger.log(`Missing data compared to ' + ${senderAddress}`);
          await this.messageSenderService.sendSyncRequestMessage(senderAddress, thisNodeSyncRequest);
        } else {
          await this.nodeService.setStartupComplete();
        }
      }
    }
  }


  async onModuleInit() {
    this.logger.debug('Sync Service initialising');

    try {
      this.logger.log('Broadcast Startup Ping');
      // await this.nodeService.updateLeader();
      const syncRequest = await this.nodeService.getSyncRequest();

      // This ensures that our responsive flags in the node table are up-to-date.
      await this.messageSenderService.broadcastPing(syncRequest, true);

    } catch (err) {
      this.logger.error('Failed to initialise Sync Service', {err});
    }
  }

  async processSyncRequest(requestingAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.debug('Processing Sync Request from ' + requestingAddress);

    const thisNode = await this.nodeService.getThisNode();
    if (!thisNode.isLeader) {
      this.logger.warn('Received Sync Request as non-leader')
      return;
    }

    const submissions = await this.db.submissions.find({
      index: {$gt: syncRequest.latestSubmissionIndex}
    });

    const customerHoldings = await this.db.customerHoldings.find({
      submissionId: {$in: submissions.map(s => s._id)}
    });

    const submissionConfirmations = await this.db.submissionConfirmations.find({
      submissionId: {$in: submissions.map(s => s._id)}
    });

    const verificationsToReturn = await this.db.verifications.find({
      index: {$gt: syncRequest.latestVerificationIndex}
    });

    const walletAddresses = await this.db.walletAddresses.find({})

    setTimeout(async () => {
      await this.messageSenderService.sendSyncDataMessage(requestingAddress, {
        submissions: submissions,
        verifications: verificationsToReturn,
        customerHoldings: customerHoldings,
        submissionConfirmations: submissionConfirmations,
        walletAddresses: walletAddresses
      });
    }, 1000);
  }

  async processSyncData(senderAddress: string, data: SyncDataMessage) {
    this.logger.log('Processing Sync Data', data);

    const leaderAddress = await this.nodeService.getLeaderAddress();
    if (senderAddress != leaderAddress) {
      this.logger.warn('Received sync data from non-leader')
      return;
    }

    const thisNode = await this.nodeService.getThisNode();
    if (!thisNode.isStarting) {
      this.logger.error('Received process sync data out of startup phase');
      return;
    }

    if (data.verifications.length > 0) {
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

    if (data.walletAddresses.length > 0) {
      await this.db.walletAddresses.deleteMany({});
      await this.db.walletAddresses.insertManyRecords(data.walletAddresses)
    }

    await this.nodeService.emitNodes();
  }
}
