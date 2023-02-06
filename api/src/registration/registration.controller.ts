import { Post, Controller, Body, Get, Query } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import {
  RegistrationApprovalDto,
  TokenDto,
  RegistrationStatusDto,
  SendRegistrationRequestDto,
  ApprovalStatusDto
} from '../types/registration.dto';
import { ApiBody, ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('registration')
@ApiTags('registration')
export class RegistrationController {

  constructor(
    private registrationService: RegistrationService
  ) {
  }

  @Post('send-registration')
  @ApiBody({ type: SendRegistrationRequestDto })
  async sendRegistration(
    @Body() sendRegistrationRequestDto: SendRegistrationRequestDto
  ) {
    await this.registrationService.sendRegistration(sendRegistrationRequestDto);
  }

  @Post('approve')
  @ApiBody({ type: RegistrationApprovalDto })
  @ApiResponse({ type: ApprovalStatusDto })
  async approve(
    @Body() approvalDto: RegistrationApprovalDto
  ): Promise<ApprovalStatusDto> {
    return await this.registrationService.approve(approvalDto.token, approvalDto.approved);
  }

  @Get('approval-status')
  @ApiQuery({
    name: 'token',
    required: true
  })
  @ApiResponse({ type: ApprovalStatusDto })
  async getApprovalStatus(
    @Query('token') token: string
  ): Promise<ApprovalStatusDto> {
    return await this.registrationService.getApprovalStatus(token);
  }

  @Post('verify-email')
  @ApiBody({ type: TokenDto })
  @ApiResponse({ type: RegistrationStatusDto })
  async verifyEmail(
    @Body() registrationVerificationDto: TokenDto
  ): Promise<RegistrationStatusDto> {
    return await this.registrationService.verifyEmail(registrationVerificationDto.token);
  }

  @Post('initiate-approvals')
  @ApiBody({ type: TokenDto })
  async initiateApprovals(
    @Body() registrationVerificationDto: TokenDto
  ): Promise<RegistrationStatusDto> {
    return await this.registrationService.initiateApprovals(registrationVerificationDto.token);
  }

  @Post('status')
  @ApiBody({ type: TokenDto })
  async getStatus(
    @Body() tokenDto: TokenDto
  ): Promise<RegistrationStatusDto> {
    return await this.registrationService.getRegistrationStatus(tokenDto.token);
  }

}
