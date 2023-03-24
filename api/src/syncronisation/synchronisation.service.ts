import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getLatestSubmissionBlock } from '../submission/get-latest-submission-block';
import { DbService } from '../db/db.service';
import { MessageSenderService } from '../network/message-sender.service';
import { NodeService } from '../node';
import { getLatestVerificationBlock } from '../verification/get-latest-verification-block';
import { SyncDataMessage, SyncRequestMessage } from '@bcr/types';
import { SubmissionConfirmation } from '../types/submission-confirmation.types';
import { ApiConfigService } from '../api-config';
import { Cron } from '@nestjs/schedule';
import { isMissingData } from './is-missing-data';

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

  @Cron('0 * * * * *')
  async cronPing() {
    this.logger.debug('broadcast cron ping');
    const syncRequest = await this.getSyncRequest()
    await this.nodeService.setStatus(false, this.apiConfigService.nodeAddress, syncRequest)
    await this.messageSenderService.broadcastPing(syncRequest)
  }

  async processPing(senderAddress: string, syncRequest: SyncRequestMessage) {
    await this.nodeService.setStatus(false, senderAddress, syncRequest)
    //
    // const thisNode = await this.nodeService.getThisNode()
    // if ( isMissingData(syncRequest, thisNode ) ) {
    //   this.logger.log('Missing data compared to ' + senderAddress);
    //   await this.messageSenderService.sendSyncRequestMessage(senderAddress, syncRequest);
    // }
  }

  public async getSyncRequest(): Promise<SyncRequestMessage> {
    const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
    const latestVerificationBlock = await getLatestVerificationBlock(this.db);

    return {
      latestSubmissionHash: latestSubmissionBlock?.hash || null,
      latestSubmissionIndex: latestSubmissionBlock?.index || 0,
      latestVerificationHash: latestVerificationBlock?.hash || null,
      latestVerificationIndex: latestVerificationBlock?.index || 0
    }
  }

  async onModuleInit() {
    this.logger.debug('sync service initialising');

    this.logger.log('broadcast startup ping');
    const syncRequest = await this.getSyncRequest()

    // This ensures that our responsive flags in the node table are up-to-date.
    await this.messageSenderService.broadcastPing(syncRequest,true)

    const { selectedNode } = await this.nodeService.getCurrentMasterNode();
    if (!selectedNode || selectedNode.address === this.apiConfigService.nodeAddress) {
      this.logger.log('No network to sync with on startup')
      return;
    }

    this.logger.log('Sending sync request to ' + selectedNode.address);
    await this.messageSenderService.sendSyncRequestMessage(selectedNode.address, syncRequest);
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
      index: { $gt: syncRequest.latestVerificationIndex }
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
    this.logger.debug('Process sync data', data);

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
