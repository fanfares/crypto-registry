import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import {
  RegisterUserDto,
  ResetPasswordDto,
  SignInTokens,
  SignInDto,
  UserRecord,
  VerifyUserDto
} from '../types/user.types';
import * as jwt from 'jsonwebtoken';
import { ApiConfigService } from '../api-config';
import { MailService } from '../mail-service';
import { PasswordHasher } from './password-hasher';
import { createSignInCredentials } from './sign-in';
import { validatePasswordRules } from './validate-password-rules';
import { TokenPayload } from './jwt-payload.type';


@Injectable()
export class UserService {
  constructor(
    private logger: Logger,
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private mailService: MailService
  ) {
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const user = await this.dbService.users.findOne({ email: registerUserDto.email });
    let userId = user?._id || null;
    if (!userId) {
      userId = await this.dbService.users.insert({
        email: registerUserDto.email,
        isVerified: false
      });
    }
    const token = jwt.sign({ userId }, this.apiConfigService.jwtSigningSecret, {
      expiresIn: '1 hour'
    });
    const link = `${this.apiConfigService.clientAddress}/reset-password?token=${token}`;
    await this.mailService.sendUserVerification(registerUserDto.email, link);
  }

  private async decodeVerificationToken(token: string): Promise<UserRecord> {
    let userId: string;
    try {
      const payload = jwt.verify(token, this.apiConfigService.jwtSigningSecret) as TokenPayload;
      userId = payload.userId;
    } catch (err) {
      this.logger.error('Failed to decode verification token');
      throw new BadRequestException('Failed to decode verification token');
    }

    const user = await this.dbService.users.get(userId);
    if (!user) {
      this.logger.error('Failed to find user');
      throw new BadRequestException('Invalid Token');
    }
    return user;
  }

  async verifyUser(verifyUserDto: VerifyUserDto): Promise<void> {
    const user = await this.decodeVerificationToken(verifyUserDto.token);
    await this.dbService.users.update(user._id, { isVerified: true });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SignInTokens> {
    const user = await this.decodeVerificationToken(resetPasswordDto.token);
    validatePasswordRules(resetPasswordDto.password);
    const passwordHash = await PasswordHasher.hash(resetPasswordDto.password);
    await this.dbService.users.update(user._id, { passwordHash });
    return this.signIn({ email: user.email, password: resetPasswordDto.password });
  }

  async signIn(signInDto: SignInDto): Promise<SignInTokens> {
    const user = await this.dbService.users.findOne({ email: signInDto.email });
    if (!user) {
      this.logger.error('No such user', { email: signInDto.email });
      throw new BadRequestException('There is no user account with this email');
    }

    const correctPassword = await PasswordHasher.verify(signInDto.password, user.passwordHash);
    if (!correctPassword) {
      this.logger.error('Invalid password')
      throw new BadRequestException('Invalid Password');
    }
    await this.dbService.users.update(user._id, { lastSignIn: new Date() });
    return await createSignInCredentials(user, this.apiConfigService.jwtSigningSecret);
  }

  async getUserByToken(idToken: string) {
    return this.decodeVerificationToken(idToken);
  }

  async refreshToken(
    refreshToken: string
  ): Promise<SignInTokens> {
    this.logger.debug('refresh-token');
    const user = await this.getUserByToken(refreshToken);
    return await createSignInCredentials(user, this.apiConfigService.jwtSigningSecret);
  }
}
