import { Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto } from '@bcr/types';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';
import { getWinningPost } from '../node/get-winning-post';
import { AbstractSubmissionService } from './abstract-submission.service';
import { EventGateway } from '../event-gateway';
import { MessageSenderService } from '../network/message-sender.service';
import { SubmissionWalletService } from './submission-wallet.service';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';

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
    const isReceiver = createSubmissionDto.receiverAddress === this.apiConfigService.nodeAddress;
    if (isReceiver) {
      await this.messageSenderService.broadcastCreateSubmission({
        ...createSubmissionDto,
        _id: submissionId
      });
    }

    return submissionId;
  }

  async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage): Promise<void> {
    await super.confirmSubmission(confirmingNodeAddress, confirmation);
    if ( confirmingNodeAddress === this.apiConfigService.nodeAddress ) {
      await this.messageSenderService.broadcastSubmissionConfirmation(confirmation);
    }
  }

}
