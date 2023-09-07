import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, CustomerHoldingDto, SubmissionRecord, SubmissionStatus } from '@bcr/types';
import { getHash } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { MessageSenderService } from '../network/message-sender.service';
import { EventGateway } from '../network/event.gateway';
import { NodeService } from '../node';
import { getWinningPost } from "../node/get-winning-post";
import { AbstractSubmissionService } from "./abstract-submission.service";

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
    private messageSenderService: MessageSenderService,
  ) {
    super(db, bitcoinServiceFactory, apiConfigService, walletService, logger, eventGateway, nodeService);
  }

  async waitForPayment(submission: SubmissionRecord) {
    await super.waitForPayment(submission);

    await this.messageSenderService.broadcastSubmissionConfirmation({
      submissionId: submission._id,
      submissionHash: submission.hash,
      confirmed: true
    });
  }


  async createSubmission(
    createSubmissionDto: CreateSubmissionDto
  ): Promise<string> {
    const currentLocalLeader = await this.nodeService.getLeaderAddress()
    this.logger.log('create networked submission:' + createSubmissionDto._id, {
      createSubmissionDto, currentLocalLeader
    });

    if (createSubmissionDto._id) {
      const submission = await this.db.submissions.get(createSubmissionDto._id);
      if (submission) {
        this.logger.log('Receiver received submission update from leader', {createSubmissionDto, currentLocalLeader});
        if (!createSubmissionDto.paymentAddress) {
          this.logger.error('Follower expected payment address from leader', {createSubmissionDto, currentLocalLeader});
          return;
        }
        await this.assignLeaderDerivedData(submission._id, createSubmissionDto.paymentAddress,
          createSubmissionDto.leaderAddress, createSubmissionDto.confirmationsRequired);
        await this.emitSubmission(submission._id)
        return;
      }
    }

    return await super.createSubmission(createSubmissionDto);
  }

  async retrieveWalletBalance(
    submissionId: string,
  ) {
    const walletBalanceCheckFailed = await super.retrieveWalletBalance(submissionId);

    if (walletBalanceCheckFailed) {
      return walletBalanceCheckFailed;
    }

    const submission = await this.db.submissions.get(submissionId);

    const leaderAddress = await this.nodeService.getLeaderAddress();
    this.logger.log('Wallet Balance retrieved', {
      submission, leaderAddress
    })
    if (!submission.paymentAddress) {
      const customerHoldingsDto: CustomerHoldingDto[] = (await this.db.customerHoldings
        .find({submissionId}))
        .map(holding => ({
          hashedEmail: holding.hashedEmail,
          amount: holding.amount
        }));

      const createSubmissionDto: CreateSubmissionDto = {
        customerHoldings: customerHoldingsDto,
        receiverAddress: submission.receiverAddress,
        leaderAddress: leaderAddress,
        exchangeZpub: submission.exchangeZpub,
        exchangeName: submission.exchangeName,
        _id: submissionId
      };

      const isLeader = await this.nodeService.isThisNodeLeader();
      if (isLeader) {
        this.logger.log('Leader received new submission:' + submissionId);
        const paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network), 'Registry');
        const nodeCount = await this.nodeService.getCurrentNodeCount();
        const confirmationsRequired = getWinningPost(nodeCount);
        const success = await this.assignLeaderDerivedData(submissionId, paymentAddress, leaderAddress, confirmationsRequired);
        if (success) {
          await this.messageSenderService.broadcastCreateSubmission({
            ...createSubmissionDto,
            paymentAddress: paymentAddress,
            confirmationsRequired: confirmationsRequired
          });
        } else {
          this.logger.error('Failed to assign leader derived data', {submissionId})
          return;
        }
      } else {
        this.logger.log('Follower received new submission', {createSubmissionDto});
        const leaderAddress = await this.nodeService.getLeaderAddress();
        if (!leaderAddress) {
          throw new BadRequestException('Cannot process request when leader is not elected')
        }
        await this.messageSenderService.sendCreateSubmission(leaderAddress, createSubmissionDto);
      }
    } else {
      this.logger.log('Follower received submission from leader', {submission});
      const success = await this.assignLeaderDerivedData(submissionId, submission.paymentAddress, leaderAddress, submission.confirmationsRequired);
      if (!success) {
        this.logger.error('Failed to assign leader derived data', {submissionId})
        return;
      }
    }

    // Move to next step
    await this.db.submissions.update(submission._id, {
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
    });

    await this.emitSubmission(submissionId);
  }

  private async assignLeaderDerivedData(
    submissionId: string,
    paymentAddress: string,
    leaderAddress: string,
    confirmationsRequired: number
  ): Promise<boolean> {
    const submission = await this.db.submissions.get(submissionId);

    if (!submission) {
      this.logger.log('Cannot find submission ', {submissionId});
      return false;
    }

    const customerHoldings = await this.db.customerHoldings.find({submissionId}, {
      projection: {
        hashedEmail: 1,
        amount: 1
      }
    });

    const hash = getHash(JSON.stringify({
      receiverAddress: submission.receiverAddress,
      paymentAddress: paymentAddress,
      network: submission.network,
      paymentAmount: submission.paymentAmount,
      totalCustomerFunds: submission.totalCustomerFunds,
      exchangeName: submission.exchangeName,
      exchangeZpub: submission.exchangeZpub,
      holdings: customerHoldings.map(h => ({
        hashedEmail: h.hashedEmail.toLowerCase(),
        amount: h.amount
      }))
    }), 'sha256');

    // todo - only hash and preceding hash should be required here.
    await this.db.submissions.update(submissionId, {
      hash, paymentAddress, leaderAddress, confirmationsRequired
    });

    await this.walletService.storeReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network), 'Registry', paymentAddress);
    await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.nodeService.getSyncRequest());
    return true;
  }
}
