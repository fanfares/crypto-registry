import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getLatestSubmissionBlock } from '../submission/get-latest-submission-block';
import { DbService } from '../db/db.service';
import { MessageSenderService } from '../network/message-sender.service';
import { NodeService } from '../node';
import { getLatestVerificationBlock } from '../verification/get-latest-verification-block';
import { MessageType, SyncDataMessage, SyncRequestMessage } from '@bcr/types';
import { SubmissionConfirmation } from '../types/submission-confirmation.types';
import { ApiConfigService } from '../api-config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SynchronisationService implements OnModuleInit {

  constructor(
    private db: DbService,
    private messageSenderService: MessageSenderService,
    private nodeService: NodeService,
    private logger: Logger,
    private apiConfigService: ApiConfigService
  ) {
  }

  // @Cron('0 * * * * *')
  // async cronPing() {
  //   this.logger.debug('broadcast cron ping');
  //   await this.nodeService.setStatus(false, this.apiConfigService.nodeAddress)
  //   await this.messageSenderService.broadcastPing()
  // }

  async onModuleInit() {
    this.logger.debug('broadcast startup ping');
    await this.messageSenderService.broadcastPing(true)

    this.logger.debug('check-sync');
    const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
    const latestVerificationBlock = await getLatestVerificationBlock(this.db);
    const { selectedNode } = await this.nodeService.getSelectedNode();

    if (!selectedNode || selectedNode.address === this.apiConfigService.nodeAddress) {
      this.logger.warn('Cannot sync on startup')
      return;
    }

    this.logger.debug('Sending sync request to ' + selectedNode.address);
    await this.messageSenderService.sendSyncRequestMessage(selectedNode.address, {
      latestSubmissionHash: latestSubmissionBlock?.hash || null,
      latestSubmissionIndex: latestSubmissionBlock?.index || 0,
      latestVerificationHash: latestVerificationBlock?.hash || null,
      latestVerificationIndex: latestVerificationBlock?.index || 0
    });
  }

  async processSyncRequest(requestingAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.debug('Process sync request from ' + requestingAddress);
    const submissions = await this.db.submissions.find({
      index: { $gt: syncRequest.latestSubmissionIndex }
    });

    const customerHoldings = await this.db.customerHoldings.find({
      paymentAddress: { $in: submissions.map(s => s.paymentAddress) }
    });

    const submissionConfirmations = await this.db.submissionConfirmations.find({
      submissionId: { $in: submissions.map(s => s._id) }
    });

    const verificationsToReturn = await this.db.verifications.find({
      index: { $gt: syncRequest.latestSubmissionIndex }
    });

    setTimeout(async () => {
      await this.messageSenderService.sendSyncDataMessage(requestingAddress, {
        submissions: submissions,
        verifications: verificationsToReturn,
        customerHoldings: customerHoldings,
        submissionConfirmations: submissionConfirmations
      });
    }, 1000)

  }

  async processSyncData(data: SyncDataMessage) {
    this.logger.debug('Process sync data');

    if (data.verifications.length > 0) {
      await this.db.verifications.insertManyRecords(data.verifications);
    }

    if (data.submissions.length > 0) {
      await this.db.submissions.insertManyRecords(data.submissions);
      await this.db.customerHoldings.insertManyRecords(data.customerHoldings);
      const outputSubmissions = await this.db.submissions.find({
        hash: { $in: data.submissions.map(s => s.hash) }
      });
      const submissionConfirmations: SubmissionConfirmation[] = [];
      for (const inputSubmission of data.submissions) {
        const outputSubmission = outputSubmissions.find(s => s.hash === inputSubmission.hash);
        const inputConfirmations = data.submissionConfirmations.filter(sc => sc.submissionId === inputSubmission._id);
        inputConfirmations.forEach(c => {
          submissionConfirmations.push({
            submissionId: outputSubmission._id,
            confirmed: c.confirmed,
            nodeAddress: c.nodeAddress
          });
        });
      }
      if (submissionConfirmations.length > 0) {
        await this.db.submissionConfirmations.insertMany(submissionConfirmations);
      }
    }
  }
}
