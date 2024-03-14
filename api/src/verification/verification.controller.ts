import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  VerificationDto,
  VerificationMessageDto,
  VerificationRequestDto, VerificationResultDto,
  VerificationStatus,
  VerifyByUidDto
} from '@bcr/types';
import { VerificationService } from './verification.service';
import { ApiConfigService } from '../api-config';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {

  constructor(
    private verificationService: VerificationService,
    private apiConfigService: ApiConfigService
  ) {
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

    const { verificationId } = await this.verificationService.createVerification(verificationRequestMessage);
    return this.verificationService.getVerificationDto(verificationId)
  }

  @Post('verify-by-uid')
  @ApiBody({type: VerifyByUidDto})
  @ApiResponse({type: VerificationResultDto})
  async verifyByUid(
    @Body() request: VerifyByUidDto
  ): Promise<VerificationResultDto> {
    return await this.verificationService.verifyByUid(request);
  }

  @Get()
  @ApiQuery({name: 'email'})
  async getVerificationsByEmail(
    @Query('email') email: string
  ): Promise<VerificationDto[]> {
    return this.verificationService.getVerificationsByEmail(email);
  }
}
