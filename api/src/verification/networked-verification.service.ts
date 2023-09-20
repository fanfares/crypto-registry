import { Injectable, Logger } from '@nestjs/common';
import { VerificationMessageDto, VerificationStatus } from '@bcr/types';
import { MailService, VerifiedHoldings } from '../mail-service';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from '../submission';
import { NodeService } from '../node';
import { VerificationResponse, VerificationService } from "./verification.service";
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

  async createVerification(verificationMessageDto: VerificationMessageDto): Promise<VerificationResponse> {
    if ( verificationMessageDto._id ) {
      // Reply from Leader, or New Verification from Leader.
      const verification = await this.db.verifications.get(verificationMessageDto._id);
      if ( verification ) {
        this.logger.log('verification update received', { verificationMessageDto });

        const verifiedHoldings = await super.getVerifiedHoldings(verification.hashedEmail);

        await this.db.verifications.update(verificationMessageDto._id, {
          status: verificationMessageDto.status,
          leaderAddress: verificationMessageDto.leaderAddress
        })

        await this.emitVerification(verificationMessageDto._id);

        return {
          verificationId: verificationMessageDto._id,
          verifiedHoldings: verifiedHoldings
        }
      }
    }

    return super.createVerification(verificationMessageDto);
  }

  protected async processVerification(
    verificationId: string,
    verifiedHoldings: VerifiedHoldings[],
    requesterEmail: string,
    newRequest: boolean
  ) {
    this.logger.log('process verification:' + verificationId + ' as ' + (newRequest ? 'new' : 'existing'));
    const verification = await this.db.verifications.get(verificationId);
    const isLeader = await this.nodeService.isThisNodeLeader()
    const leaderAddress = await this.nodeService.getLeaderAddress();

    if ( isLeader ) {
      await this.mailService.sendVerificationEmail(requesterEmail.toLowerCase(),
        verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress
      );

      await this.db.verifications.update(verificationId, {
        status: VerificationStatus.SENT,
        leaderAddress: leaderAddress
      })

      await this.emitVerification(verificationId);

      await this.messageSenderService.broadcastVerification({
        ...verification,
        email: requesterEmail,
        status: VerificationStatus.SENT,
        leaderAddress: leaderAddress,
      });

    } else if ( newRequest ) {

      // Send new verification from follower to leader
      await this.messageSenderService.sendVerification(leaderAddress, {
        ...verification,
        email: requesterEmail,
        status: VerificationStatus.RECEIVED,
        leaderAddress: leaderAddress,
      });
    }
  }
}
