import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ResetPasswordDto, SignInDto, SignInTokens, UserRecord, VerifyPasswordResetTokenResultDto } from '@bcr/types';
import * as jwt from 'jsonwebtoken';
import { ApiConfigService } from '../api-config';
import { MailService } from '../mail-service';
import { PasswordHasher } from './password-hasher';
import { createSignInCredentials } from './create-sign-in-credentials';
import { validatePasswordRules } from './validate-password-rules';
import { TokenPayload } from './jwt-payload.type';
import { TokenExpiredError } from 'jsonwebtoken';
import { SendAgainDto } from '../types/auth.types';


@Injectable()
export class AuthService {
  constructor(
    private logger: Logger,
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private mailService: MailService
  ) {
  }

  private async decodeVerificationToken(token: string): Promise<UserRecord> {
    let userId: string;
    try {
      const payload = jwt.verify(token, this.apiConfigService.jwtSigningSecret) as TokenPayload;
      userId = payload.userId;
    } catch (err) {
      let userMessage = 'Token verification failed'
      if ( err instanceof TokenExpiredError ) {
        userMessage  = 'Token expired, please request a new token'
      }
      this.logger.error('Failed to decode verification token', { err: err.message, userMessage, token });
      throw new ForbiddenException(userMessage);
    }

    const user = await this.dbService.users.get(userId);
    if (!user) {
      this.logger.error('Failed to find user');
      throw new ForbiddenException('Invalid Token');
    }
    return user;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SignInTokens> {
    const user = await this.decodeVerificationToken(resetPasswordDto.token);
    validatePasswordRules(resetPasswordDto.password);
    const passwordHash = await PasswordHasher.hash(resetPasswordDto.password);
    await this.dbService.users.update(user._id, {passwordHash, isVerified: true});
    return this.signIn({email: user.email, password: resetPasswordDto.password});
  }

  async sendAgain(
    sendAgainDto: SendAgainDto
  ) {
    if ( sendAgainDto.invite ) {
      await this.sendUserInvite(sendAgainDto.userId)
    } else {
      await this.sendPasswordResetEmail(sendAgainDto.email);
    }
  }

  async sendUserInvite(userId: string) {
    const user = await this.dbService.users.get(userId);
    if (!user) {
      throw new BadRequestException('Invalid user id');
    }
    const link = this.getPasswordResetLink(user, true);
    await this.mailService.sendExchangeUserInvite(user.email, link);
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.dbService.users.findOne({email});
    if (!user) {
      throw new BadRequestException('No user with this email');
    }
    const link = this.getPasswordResetLink(user, false);
    await this.mailService.sendResetPasswordEmail(email, link);
  }

  private getPasswordResetLink(user: UserRecord, invite: boolean) {
    const token = jwt.sign({
      userId: user._id,
    }, this.apiConfigService.jwtSigningSecret, {
      expiresIn: invite ? '3 days' : '1 hour'
    });
    return `${this.apiConfigService.clientAddress}/reset-password?token=${token}&email=${user.email}&invite=${invite}&userId=${user._id}`;
  }

  async signIn(signInDto: SignInDto): Promise<SignInTokens> {
    const user = await this.dbService.users.findOne({email: signInDto.email});
    if (!user) {
      throw new ForbiddenException('There is no user account with this email');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('User is not verified');
    }

    if (!user.passwordHash) {
      throw new ForbiddenException('No password set');
    }

    const correctPassword = await PasswordHasher.verify(signInDto.password, user.passwordHash);
    if (!correctPassword) {
      this.logger.error('Invalid password');
      throw new BadRequestException('Invalid Password');
    }
    await this.dbService.users.update(user._id, {lastSignIn: new Date()});
    return await createSignInCredentials(user, this.apiConfigService.jwtSigningSecret);
  }

  async getUserByToken(idToken: string) {
    try {
      return this.decodeVerificationToken(idToken);
    } catch (err) {
      return null;
    }
  }

  async getUserByEmail(email: string) {
    return this.dbService.users.findOne({email});
  }

  async refreshToken(
    refreshToken: string
  ): Promise<SignInTokens> {
    this.logger.debug('refresh-token');
    const user = await this.getUserByToken(refreshToken);
    return await createSignInCredentials(user, this.apiConfigService.jwtSigningSecret);
  }

  async verifyPasswordResetToken(
    token: string
  ): Promise<VerifyPasswordResetTokenResultDto> {
    try {
      jwt.verify(token, this.apiConfigService.jwtSigningSecret);
      return { expired: false }
    } catch ( err ) {
      if ( err instanceof TokenExpiredError ) {
        return {expired: true}
      } else {
        this.logger.error('Verify password reset token failed', {
          err: err.message
        })
        return { expired: false }
      }
    }

  }
}
