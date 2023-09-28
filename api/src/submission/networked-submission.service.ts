import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, SubmissionStatus } from '@bcr/types';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { getWinningPost } from '../node/get-winning-post';
import { AbstractSubmissionService } from './abstract-submission.service';
import { EventGateway } from '../event-gateway';
import { MessageSenderService } from '../network/message-sender.service';
import { SubmissionWalletService } from './submission-wallet.service';

@Injectable()
export class NetworkedSubmissionService extends AbstractSubmissionService {

  constructor(
    db: DbService,
    bitcoinServiceFactory: BitcoinServiceFactory,
    apiConfigService: ApiConfigService,
    walletService: WalletService,
    logger: Logger,
    eventGateway: EventGateway,
    nodeService: NodeService,
    submissionWalletService: SubmissionWalletService,
    private messageSenderService: MessageSenderService
  ) {
    super(db, bitcoinServiceFactory, apiConfigService,
      walletService, logger, eventGateway, nodeService, submissionWalletService);
  }

  async waitForPayment(submissionid: string) {
    const paid = await super.waitForPayment(submissionid);

    if (paid) {
      await this.messageSenderService.broadcastSubmissionConfirmation({
        submissionId: submissionid,
        confirmed: true
      });
    }

    return paid;
  }

  async cancel(submissionId: string): Promise<void> {
    await super.cancel(submissionId);
    await this.messageSenderService.broadcastCancelSubmission(submissionId);
  }

  async getConfirmationsRequired(): Promise<number> {
    const nodeCount = await this.nodeService.getCurrentNodeCount();
    return getWinningPost(nodeCount);
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto
  ): Promise<string> {
    const submissionId = await super.createSubmission(createSubmissionDto);

    const isLeader = await this.nodeService.isThisNodeLeader();
    const isReceiver = createSubmissionDto.receiverAddress === this.apiConfigService.nodeAddress;
    if (isLeader) {

      const excludedAddresses = [];
      if (!isReceiver) {
        excludedAddresses.push(createSubmissionDto.receiverAddress);
      }
      await this.messageSenderService.broadcastCreateSubmission({
        ...createSubmissionDto,
        _id: submissionId
      }, excludedAddresses);

    } else {
      if (isReceiver) {
        const leaderAddress = await this.nodeService.getLeaderAddress();
        if (!leaderAddress) {
          throw new BadRequestException('Cannot process request when leader is not elected');
        }
        await this.messageSenderService.sendCreateSubmission(leaderAddress, {
          ...createSubmissionDto,
          _id: submissionId
        });
      }
    }

    return submissionId;
  }

  protected async assignLeaderData(submissionId: string) {
    const isLeader = await this.nodeService.isThisNodeLeader();
    if (isLeader) {
      await super.assignLeaderData(submissionId);
      const submission = await this.db.submissions.get(submissionId);
      await this.messageSenderService.broadcastLeaderSubmissionData({
        submissionId: submission._id,
        leaderAddress: submission.leaderAddress,
        confirmationsRequired: submission.confirmationsRequired,
        wallets: submission.wallets
      });
    } else {
      // Follower has received leader data, so move the process on.
      const submission = await this.db.submissions.get(submissionId);
      if (submission.leaderAssignedWallets) {
        await this.db.submissions.update(submissionId, {
          wallets: submission.leaderAssignedWallets,
          status: SubmissionStatus.WAITING_FOR_PAYMENT
        }, {
          unset: {
            leaderAssignedWallets: 1
          }
        });
        await this.submissionWalletService.storePaymentAddresses(submission.leaderAssignedWallets, submission.network);
        await this.emitSubmission(submissionId);
      }
    }
  }
}
