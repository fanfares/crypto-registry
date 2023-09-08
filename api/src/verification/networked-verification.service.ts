import { Injectable, Logger } from '@nestjs/common';
import { VerificationStatus } from '@bcr/types';
import { MailService, VerifiedHoldings } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from '../submission';
import { NodeService } from '../node';
import { VerificationService } from "./verification.service";
import { MessageSenderService } from "../network/message-sender.service";
import { EventGateway } from "../event-gateway";

@Injectable()
export class NetworkedVerificationService extends VerificationService {

  constructor(
    db: DbService,
    mailService: MailService,
    logger: Logger,
    apiConfigService: ApiConfigService,
    submissionService: AbstractSubmissionService,
    private messageSenderService: MessageSenderService,
    eventGateway: EventGateway,
    nodeService: NodeService
  ) {
    super(db, mailService, logger, apiConfigService, submissionService, eventGateway, nodeService)
  }

  protected async processVerification(
    verificationId: string,
    verifiedHoldings: VerifiedHoldings[],
    requesterEmail: string
  ) {

    const isLeader = await this.nodeService.isThisNodeLeader()
    if (isLeader) {
      this.logger.log(`Single Node sending verification email to ${requesterEmail}`);
      await this.mailService.sendVerificationEmail(requesterEmail.toLowerCase(),
        verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress
      );

      const verification = await this.db.verifications.get(verificationId);
      const leaderAddress = await this.nodeService.getLeaderAddress();
      await this.messageSenderService.broadcastVerification({
        ...verification,
        email: requesterEmail,
        status: VerificationStatus.SENT,
        leaderAddress: leaderAddress,
      });
      await this.emitVerification(verificationId);
    }
  }
}
