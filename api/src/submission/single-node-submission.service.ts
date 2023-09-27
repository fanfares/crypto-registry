import { Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { AbstractSubmissionService } from './abstract-submission.service';
import { EventGateway } from '../event-gateway';
import { SubmissionWalletService } from './submission-wallet.service';

@Injectable()
export class SingleNodeSubmissionService extends AbstractSubmissionService {

  constructor(
    db: DbService,
    bitcoinServiceFactory: BitcoinServiceFactory,
    apiConfigService: ApiConfigService,
    walletService: WalletService,
    logger: Logger,
    eventGateway: EventGateway,
    nodeService: NodeService,
    submissionWalletService: SubmissionWalletService
  ) {
    super(db, bitcoinServiceFactory, apiConfigService, walletService, logger, eventGateway, nodeService, submissionWalletService);
  }

  async getConfirmationsRequired(): Promise<number> {
    return 1;
  }

  // async retrieveWalletBalance(submissionId: string): Promise<boolean> {
  //   const walletBalanceCheckFailed = await super.retrieveWalletBalance(submissionId);
  //
  //   if (walletBalanceCheckFailed) {
  //     return walletBalanceCheckFailed;
  //   }
  //
  //   const submission = await this.db.submissions.get(submissionId);
  //
  //   if (submission.paymentAddress) {
  //     this.logger.error('Submission has payment address already', {submission});
  //     return false
  //   }
  //
  //   const paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network));
  //
  //   await this.db.submissions.update(submissionId, {
  //     status: SubmissionStatus.WAITING_FOR_PAYMENT,
  //     paymentAddress: paymentAddress.address,
  //     paymentAddressIndex: paymentAddress.index,
  //     confirmationsRequired: 1
  //   });
  //
  //   await this.emitSubmission(submissionId);
  //
  //   return false;
// }
}
