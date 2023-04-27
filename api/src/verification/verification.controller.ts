import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChainStatus,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord,
  VerificationRequestDto
} from '@bcr/types';
import { VerificationService } from './verification.service';
import { MessageSenderService } from '../network/message-sender.service';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { NodeService } from '../node';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {

  constructor(
    private verificationService: VerificationService,
    private messageSenderService: MessageSenderService,
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: Logger,
    private nodeService: NodeService
  ) {
  }

  @Get('verify-chain')
  @ApiResponse({type: ChainStatus})
  async verifyChain(): Promise<ChainStatus> {

    const verifications = await this.dbService.verifications.find({}, {
      sort: {
        index: 1
      }
    });

    let previousVerification: VerificationRecord;
    let brokenLink: VerificationRecord;
    for (const verification of verifications) {
      if (previousVerification) {
        if (verification.precedingHash !== verification.hash) {
          brokenLink = verification;
          break;
        }
      }
      previousVerification = verification;
    }

    return {
      isVerified: !brokenLink,
      brokenLinkVerificationId: brokenLink?._id
    };
  }

  @Post()
  @ApiBody({type: VerificationRequestDto})
  @ApiResponse({type: VerificationDto})
  async createVerification(
    @Body() verificationRequestDto: VerificationRequestDto
  ): Promise<VerificationDto> {
    const leaderNode = await this.nodeService.getLeader();

    if (!leaderNode) {
      this.logger.error('No selected node to send verification email');
      return;
    }

    const verificationRequestMessage: VerificationMessageDto = {
      receivingAddress: this.apiConfigService.nodeAddress,
      leaderAddress: leaderNode.address,
      email: verificationRequestDto.email,
      requestDate: new Date()
    };

    const verificationId = await this.verificationService.createVerification(verificationRequestMessage);
    return this.verificationService.getVerificationDto(verificationId)
  }

  @Get()
  @ApiQuery({name: 'email'})
  async getVerificationsByEmail(
    @Query('email') email: string
  ): Promise<VerificationDto[]> {
    return this.verificationService.getVerificationsByEmail(email);
  }

}
