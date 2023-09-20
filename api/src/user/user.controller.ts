import { Body, Controller, ForbiddenException, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  CredentialsDto,
  RegisterUserDto,
  ResetPasswordDto,
  SendResetPasswordDto,
  SignInDto,
  VerifyUserDto
} from '../types/user.types';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RefreshTokenCookies } from './refresh-token-cookies';
import { Request, Response } from 'express';

@Controller('user')
@ApiTags('user')
export class UserController {

  constructor(
    private userService: UserService
  ) {
  }

  @Post('register')
  @ApiBody({type: RegisterUserDto})
  async registerUser(
    @Body() registerUserDto: RegisterUserDto
  ) {
    await this.userService.registerUser(registerUserDto);
  }

  @Post('verify')
  @ApiBody({type: VerifyUserDto})
  @HttpCode(200)
  async verifyUser(
    @Body() verifyUserDto: VerifyUserDto
  ) {
    await this.userService.verifyUser(verifyUserDto);
  }

  @Post('reset-password')
  @ApiBody({type: ResetPasswordDto})
  @ApiResponse({type: CredentialsDto})
  @HttpCode(200)
  async resetPassword(
    @Res({passthrough: true}) response: Response,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<CredentialsDto> {
    const signInTokens = await this.userService.resetPassword(resetPasswordDto);
    RefreshTokenCookies.set(response, signInTokens);
    return {
      idToken: signInTokens.idToken,
      userId: signInTokens.userId,
      isAdmin: signInTokens.isAdmin,
      idTokenExpiry: signInTokens.idTokenExpiry
    };
  }

  @Post('send-reset-password-email')
  @ApiBody({type: SendResetPasswordDto})
  @HttpCode(200)
  async sendResetPasswordEmail(
    @Body() body  : SendResetPasswordDto
  ): Promise<void> {
    await this.userService.setResetPasswordEmail(body.email);
  }

  @Post('sign-in')
  @ApiBody({type: SignInDto})
  @ApiResponse({type: CredentialsDto})
  @HttpCode(200)
  async signIn(
    @Res({passthrough: true}) response: Response,
    @Body() signInDto: SignInDto
  ): Promise<CredentialsDto> {
    const signInTokens = await this.userService.signIn(signInDto);
    RefreshTokenCookies.set(response, signInTokens);
    return {
      idToken: signInTokens.idToken,
      userId: signInTokens.userId,
      isAdmin: signInTokens.isAdmin,
      idTokenExpiry: signInTokens.idTokenExpiry
    };
  }

  @Post('sign-out')
  @HttpCode(200)
  signOut(
    @Res({passthrough: true}) response: Response
  ) {
    RefreshTokenCookies.clear(response);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Res({passthrough: true}) response: Response,
    @Req() request: Request
  ): Promise<CredentialsDto> {
    const refreshToken = request.cookies['refresh-token'];
    if (!refreshToken) {
      throw new ForbiddenException('No refresh token');
    }
    RefreshTokenCookies.clear(response);
    const signInTokens = await this.userService.refreshToken(refreshToken);
    RefreshTokenCookies.set(response, signInTokens);
    return {
      userId: signInTokens.userId,
      idToken: signInTokens.idToken,
      isAdmin: signInTokens.isAdmin,
      idTokenExpiry: signInTokens.idTokenExpiry
    };
  }
}
