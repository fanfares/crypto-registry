import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChainStatus,
  VerificationDto,
  VerificationMessageDto,
  VerificationRecord,
  VerificationRequestDto,
  VerificationStatus
} from '@bcr/types';
import { VerificationService } from './verification.service';
import { MessageSenderService } from '../network/message-sender.service';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { IsAuthenticatedGuard } from "../user/is-authenticated.guard";

@ApiTags('verification')
@Controller('verification')
export class VerificationController {

  constructor(
    private verificationService: VerificationService,
    private messageSenderService: MessageSenderService,
    private dbService: DbService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Get('verify-chain')
  @UseGuards(IsAuthenticatedGuard)
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
    const verificationRequestMessage: VerificationMessageDto = {
      receivingAddress: this.apiConfigService.nodeAddress,
      email: verificationRequestDto.email,
      requestDate: new Date(),
      status: VerificationStatus.RECEIVED
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
