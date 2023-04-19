import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {DbService} from '../db/db.service';
import {MessageSenderService} from '../network/message-sender.service';
import {NodeService} from '../node';
import {SyncDataMessage, SyncRequestMessage} from '@bcr/types';
import {Cron} from '@nestjs/schedule';
import {isMissingData} from './is-missing-data';
import {EventGateway} from '../network/event.gateway';

@Injectable()
export class SynchronisationService implements OnModuleInit {

  constructor(
    private db: DbService,
    private messageSenderService: MessageSenderService,
    private nodeService: NodeService,
    private logger: Logger,
    private eventGateway: EventGateway,
  ) {
  }

  @Cron('30 * * * * *')
  async cronPing() {
    this.logger.log('broadcast synchronisation ping');
    const syncRequest = await this.nodeService.getSyncRequest();
    await this.nodeService.checkThisNodeRecordInSync(syncRequest);
    const thisNode = await this.nodeService.getThisNode();

    // If we are still locked after one cycle, unlock and try again
    if (thisNode.isSynchronising) {
      await this.nodeService.unlockThisNode();
    }
    await this.messageSenderService.broadcastPing(syncRequest);
  }

  async processPing(senderAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.log('processing ping from ' + senderAddress);
    await this.nodeService.updateStatus(false, senderAddress, syncRequest);

    // If this message came from the leader, then check for missing data.
    const thisNodeSyncRequest = await this.nodeService.getSyncRequest();
    const leader = await this.nodeService.getLeader();
    if (leader && senderAddress === leader.address && isMissingData(syncRequest, thisNodeSyncRequest)) {
      const thisNode = await this.nodeService.getThisNode();
      this.logger.warn(`${thisNode.address} is missing data compared to ${senderAddress}`, {
        syncRequest,
        thisNodeSyncRequest
      });
      if (thisNode.isSynchronising) {
        this.logger.log('node locked for synchronising');
        return false;
      }

      const locked = this.nodeService.lockThisNode(senderAddress);
      if (!locked) {
        this.logger.log('node already locked for synchronising');
        return;
      }

      this.logger.log(`${thisNode.address} is missing data compared to ' + ${senderAddress}`);
      await this.messageSenderService.sendSyncRequestMessage(senderAddress, thisNodeSyncRequest);
    } else {
      this.logger.log(`this node is in-sync with ${senderAddress}`);
    }
  }


  async onModuleInit() {
    this.logger.debug('sync service initialising');

    try {
      this.logger.log('broadcast startup ping');
      await this.nodeService.updateLeader();
      const syncRequest = await this.nodeService.getSyncRequest();

      // This ensures that our responsive flags in the node table are up-to-date.
      await this.messageSenderService.broadcastPing(syncRequest, true);

    } catch (err) {
      this.logger.error('failed to initialise sync module', {err});
    }
  }

  async processSyncRequest(requestingAddress: string, syncRequest: SyncRequestMessage) {
    this.logger.debug('processing sync request from ' + requestingAddress);

    // todo - only if you are the leader do you respond.

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

  async processSyncData(data: SyncDataMessage) {
    this.logger.debug('processing sync data', data);

    // only take this data if it is from the leader

    const thisNode = await this.nodeService.getThisNode();

    if (!thisNode.isSynchronising) {
      this.logger.log('cannot process sync data when node is unlocked');
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

    await this.nodeService.unlockThisNode();
    this.eventGateway.emitNodes(await this.nodeService.getNodeDtos());
  }
}
