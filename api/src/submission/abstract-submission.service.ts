import { Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, SubmissionDto, SubmissionStatus } from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { getNow } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SubmissionConfirmationMessage, SubmissionConfirmationStatus } from '../types/submission-confirmation.types';
import { EventGateway } from '../event-gateway';
import { NodeService } from '../node';
import { DbInsertOptions } from '../db';
import { SubmissionWalletService } from './submission-wallet.service';

export abstract class AbstractSubmissionService {

  protected constructor(
    protected db: DbService,
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected apiConfigService: ApiConfigService,
    protected walletService: WalletService,
    protected logger: Logger,
    protected eventGateway: EventGateway,
    protected nodeService: NodeService,
    protected submissionWalletService: SubmissionWalletService
  ) {
  }

  private async processingFailed(submissionId: string, errorMessage: string) {
    this.logger.error(errorMessage);
    await this.db.submissions.update(submissionId, {
      status: SubmissionStatus.PROCESSING_FAILED,
      errorMessage: errorMessage
    });
    await this.emitSubmission(submissionId);
  }

  private async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus,
    confirmationDate?: Date
  ) {
    const modifier: any = {status};
    if (confirmationDate) {
      modifier.confirmationDate = confirmationDate;
    }
    await this.db.submissions.update(submissionId, modifier);
    await this.emitSubmission(submissionId);
  }

  protected async emitSubmission(submissionId: string) {
    const submission = await this.db.submissions.get(submissionId);
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    const submissionDto = submissionStatusRecordToDto(submission, confirmations);
    this.eventGateway.emitSubmissionUpdates(submissionDto);
  }

  async executionCycle() {
    this.logger.log('Submissions execution cycle');

    const submissions = await this.db.submissions.find({
      status: {
        $in: [
          SubmissionStatus.RETRIEVING_WALLET_BALANCE,
          SubmissionStatus.WAITING_FOR_CONFIRMATION
        ]
      },
      isCurrent: true
    }, {
      sort: {
        index: 1
      }
    });

    this.logger.log('Found ' + submissions.length + ' submissions to process', {
      submissions: submissions
    });

    for (const nextSubmission of submissions) {
      try {

        let submission = nextSubmission;
        this.logger.log('Execute submission:' + submission._id);

        if (submission.status === SubmissionStatus.RETRIEVING_WALLET_BALANCE) {
          await this.retrieveWalletBalance(nextSubmission._id);
        }

        submission = await this.db.submissions.get(submission._id);
        if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
          await this.waitForConfirmation(submission._id);
        }

      } catch (err) {
        this.logger.error('Failed to get submission status:' + err.message, {err});
      }
    }
  }

  private async getConfirmationStatus(submissionId: string) {
    const confirmations = await this.db.submissionConfirmations.find({submissionId});
    const submission = await this.db.submissions.get(submissionId);

    let status: SubmissionStatus;
    const confirmedCount = confirmations.filter(c => c.status === SubmissionConfirmationStatus.CONFIRMED).length;
    const rejectedCount = confirmations.filter(c => c.status === SubmissionConfirmationStatus.REJECTED).length;
    if (rejectedCount > 0) {
      status = SubmissionStatus.REJECTED;
    } else if (confirmedCount >= submission.confirmationsRequired) {
      status = SubmissionStatus.CONFIRMED;
    } else {
      const submission = await this.db.submissions.get(submissionId);
      status = submission.status;
    }
    return status;
  }

  async getSubmissionDto(
    submissionId: string
  ): Promise<SubmissionDto> {
    const submission = await this.db.submissions.get(submissionId);
    const confirmations = await this.db.submissionConfirmations.find({submissionId});
    return submissionStatusRecordToDto(submission, confirmations);
  }

  async processCancellation(submissionId: string) {
    await this.updateSubmissionStatus(submissionId, SubmissionStatus.CANCELLED);
    await this.emitSubmission(submissionId);
  }

  async cancel(submissionId: string) {
    await this.updateSubmissionStatus(submissionId, SubmissionStatus.CANCELLED);
    await this.emitSubmission(submissionId);
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto
  ): Promise<string> {
    this.logger.log('create submission:' + createSubmissionDto._id);

    const totalCustomerFunds = createSubmissionDto.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);

    let options: DbInsertOptions = null;

    if (createSubmissionDto._id) {
      options = {_id: createSubmissionDto._id};
    }

    const valid = this.submissionWalletService.validateSignatures(createSubmissionDto.wallets, createSubmissionDto.signingMessage);

    const submissionId = await this.db.submissions.insert({
      receiverAddress: createSubmissionDto.receiverAddress,
      network: createSubmissionDto.network,
      wallets: createSubmissionDto.wallets,
      totalCustomerFunds: totalCustomerFunds,
      totalExchangeFunds: null,
      status: valid ? SubmissionStatus.NEW : SubmissionStatus.INVALID_SIGNATURE,
      exchangeName: createSubmissionDto.exchangeName,
      isCurrent: true,
      confirmationsRequired: await this.getConfirmationsRequired(),
      confirmationDate: null,
      signingMessage: createSubmissionDto.signingMessage
    }, options);

    await this.db.customerHoldings.insertMany(createSubmissionDto.customerHoldings.map((holding) => ({
      hashedEmail: holding.hashedEmail.toLowerCase(),
      amount: holding.amount,
      network: createSubmissionDto.network,
      isCurrent: true,
      submissionId: submissionId
    })));

    if (valid) {
      await this.submissionWalletService.cancelPreviousSubmissions(createSubmissionDto.wallets, submissionId);
      await this.db.submissions.update(submissionId, {
        status: SubmissionStatus.RETRIEVING_WALLET_BALANCE
      });
    }

    await this.emitSubmission(submissionId);
    return submissionId;
  }

  protected async retrieveWalletBalance(
    submissionId: string
  ) {
    this.logger.log('Retrieve wallet balance, submission: ' + submissionId);
    try {
      await this.submissionWalletService.retrieveWalletBalances(submissionId);
      const submission = await this.db.submissions.get(submissionId);
      if (submission.totalExchangeFunds < (submission.totalCustomerFunds * this.apiConfigService.reserveLimit)) {
        const reserveLimit = Math.round(this.apiConfigService.reserveLimit * 100);
        this.logger.warn(`Submission ${submission._id} has insufficient funds ${submission.totalExchangeFunds} vs ${reserveLimit}`);
        await this.db.submissions.update(submission._id, {
          status: SubmissionStatus.INSUFFICIENT_FUNDS
        });
      } else {
        this.logger.log('Update submission status to waiting for payment address:' + submissionId);
        await this.confirmSubmission(this.apiConfigService.nodeAddress, {
          submissionId: submissionId,
          confirmed: true
        })
        await this.db.submissions.update(submission._id, {
          status: SubmissionStatus.WAITING_FOR_CONFIRMATION
        });
      }
    } catch (err) {
      await this.processingFailed(submissionId, err.message);
    }
    await this.emitSubmission(submissionId);
  }

  async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage) {
    this.logger.log('Confirm Submission', {confirmation, confirmingNodeAddress});
    try {

      const submissionConfirmation = await this.db.submissionConfirmations.findOne({
        submissionId: confirmation.submissionId,
        nodeAddress: confirmingNodeAddress
      });

      if (submissionConfirmation) {
        this.logger.log('Submission Confirmation already received');
        return;
      }

      const submission = await this.db.submissions.get(confirmation.submissionId);

      if (!submission) {
        this.logger.error('No submission for confirmation', confirmation);
        return;
      }

      await this.db.submissionConfirmations.insert({
        status: confirmation.confirmed ? SubmissionConfirmationStatus.CONFIRMED : SubmissionConfirmationStatus.REJECTED,
        submissionId: submission._id,
        nodeAddress: confirmingNodeAddress
      });

      // await this.waitForConfirmation(confirmation.submissionId);

    } catch (err) {
      this.logger.error('Failed to process submission confirmation', confirmation);
    }
  }

  private async waitForConfirmation(submissionId: string) {
    this.logger.log(`Wait for confirmation ${submissionId}`);

    const submission = await this.db.submissions.get(submissionId);

    if (submission.status !== SubmissionStatus.WAITING_FOR_CONFIRMATION && submission.status !== SubmissionStatus.CONFIRMED) {
      this.logger.log('Cannot process submission confirmation at this time');
      return;
    }

    // Finally calculate and update submission status
    const confirmationStatus = await this.getConfirmationStatus(submission._id);

    let confirmationDate: Date = null;
    if (confirmationStatus === SubmissionStatus.CONFIRMED && submission.status !== SubmissionStatus.CONFIRMED) {
      confirmationDate = getNow();
    }

    await this.updateSubmissionStatus(submission._id, confirmationStatus, confirmationDate);

  }

  abstract getConfirmationsRequired(): Promise<number>

}
