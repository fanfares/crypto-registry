import { Injectable, Logger } from '@nestjs/common';
import { MailService, VerifiedHoldings } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from '../submission';
import { NodeService } from '../node';
import { VerificationService } from "./verification.service";
import { EventGateway } from "../event-gateway";

@Injectable()
export class SingleNodeVerificationService extends VerificationService {

  constructor(
    db: DbService,
    mailService: MailService,
    logger: Logger,
    apiConfigService: ApiConfigService,
    submissionService: AbstractSubmissionService,
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
    this.logger.log(`Single Node sending verification email to ${requesterEmail}`);
    await this.mailService.sendVerificationEmail(requesterEmail.toLowerCase(),
      verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress
    );
    await this.emitVerification(verificationId);
  }
}
