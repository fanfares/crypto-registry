import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { User } from '../utils';
import { PublicKeyDto, UserRecord } from '@bcr/types';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';

@Controller('user-settings')
@ApiTags('user-settings')
@UseGuards(IsExchangeUserGuard)
export class UserSettingsController {

  constructor(
    private userSettingsService: UserSettingsService
  ) {
  }

  @Patch(':save-public-key')
  async savePublicKey(
    @User() user: UserRecord,
    @Body() body: PublicKeyDto
  ): Promise<void> {
    await this.userSettingsService.savePublicKey(user._id, body.publicKey);
  }

  @Get('public-key')
  @ApiResponse({type: PublicKeyDto})
  async getPublicKey(
    @User() user: UserRecord
  ): Promise<PublicKeyDto> {
    return this.userSettingsService.getPublicKey(user._id);
  }

}
