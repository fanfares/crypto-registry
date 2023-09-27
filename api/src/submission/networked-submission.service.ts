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
    await super.waitForPayment(submissionid);

    await this.messageSenderService.broadcastSubmissionConfirmation({
      submissionId: submissionid,
      confirmed: true
    });
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

  // async retrieveWalletBalance(
  //   submissionId: string
  // ) {
  //   await super.retrieveWalletBalance(submissionId);

  // const submission = await this.db.submissions.get(submissionId);

  //   const leaderAddress = await this.nodeService.getLeaderAddress();
  //   this.logger.log('Wallet Balance retrieved', {
  //     submission, leaderAddress
  //   });
  //
  // const isLeader = await this.nodeService.isThisNodeLeader();
  // if (isLeader) {
  //   const customerHoldingsDto: CustomerHoldingDto[] = (await this.db.customerHoldings
  //   .find({submissionId}))
  //   .map(holding => ({
  //     hashedEmail: holding.hashedEmail,
  //     amount: holding.amount
  //   }));
  //
  //   const createSubmissionDto: CreateSubmissionDto = {
  //     ...submission,
  //     customerHoldings: customerHoldingsDto
  //   };

  //     const isLeader = await this.nodeService.isThisNodeLeader();
  //     if (isLeader) {
  //       this.logger.log('Leader received new submission:' + submissionId);
  //       await this.assignLeaderDerivedData(submissionId, submission.wallets, leaderAddress, submission.confirmationsRequired);
  //       await this.messageSenderService.broadcastCreateSubmission(createSubmissionDto);
  //     } else {
  //       this.logger.log('Follower received new submission', {createSubmissionDto});
  //       const leaderAddress = await this.nodeService.getLeaderAddress();
  //       if (!leaderAddress) {
  //         throw new BadRequestException('Cannot process request when leader is not elected');
  //       }
  //       await this.messageSenderService.sendCreateSubmission(leaderAddress, createSubmissionDto);
  //     }
  //   } else {
  //     this.logger.log('Follower received submission from leader', {submission});
  //     await this.assignLeaderDerivedData(submissionId, submission.wallets, leaderAddress, submission.confirmationsRequired);
  //   }
  //
  //   // Move to next step
  //   await this.db.submissions.update(submission._id, {
  //     status: SubmissionStatus.WAITING_FOR_PAYMENT
  //   });
  //
  //   await this.emitSubmission(submissionId);
  // }

  // private async assignLeaderDerivedData(
  //   submissionId: string,
  //   wallets: SubmissionWallet[],
  //   leaderAddress: string,
  //   confirmationsRequired: number
  // ): Promise<void> {
  //   const submission = await this.db.submissions.get(submissionId);
  //
  //   for (const wallet of wallets) {
  //     const localWallet = submission.wallets.find(w => w.exchangeZpub === wallet.exchangeZpub);
  //     localWallet.paymentAddress = wallet.paymentAddress;
  //     localWallet.paymentAmount = wallet.paymentAmount
  //     localWallet.paymentAddressIndex = wallet.paymentAddressIndex
  //     localWallet.status = wallet.status;
  //   }
  //
  //   await this.db.submissions.update(submissionId, {
  //     leaderAddress, confirmationsRequired, wallets: submission.wallets
  //   });
  //
  //   await this.submissionWalletService.storePaymentAddresses(submissionId);
  //
  //   await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.nodeService.getSyncRequest());
  // }

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
      if ( submission.wallets[0].paymentAddress) {
        await this.db.submissions.update(submissionId, {
          status: SubmissionStatus.WAITING_FOR_PAYMENT
        })
      }
    }
  }
}
