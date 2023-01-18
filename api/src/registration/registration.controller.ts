import { Post, Controller, Body } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import {
  RegistrationRequestDto,
  RegistrationApprovalDto,
  TokenDto,
  RegistrationStatusDto
} from '../types/registration.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller()
export class RegistrationController {

  constructor(
    private registrationService: RegistrationService
  ) {
  }

  @Post('register')
  @ApiBody({ type: RegistrationRequestDto })
  async register(
    @Body() registrationRequest: RegistrationRequestDto
  ) {
    await this.registrationService.register(registrationRequest);
  }

  @Post('approve')
  @ApiBody({ type: RegistrationApprovalDto })
  async approve(
    @Body() approvalDto: RegistrationApprovalDto
  ) {
    await this.registrationService.approve(approvalDto.token, approvalDto.approved);
  }

  @Post('verify')
  @ApiBody({ type: TokenDto })
  async verify(
    @Body() registrationVerificationDto: TokenDto
  ) {
    await this.registrationService.verify(registrationVerificationDto.token);
  }

  @Post('status')
  @ApiBody({ type: TokenDto })
  async getStatus(
    @Body() tokenDto: TokenDto
  ): Promise<RegistrationStatusDto> {
    return await this.registrationService.getStatus(tokenDto.token);
  }

}
