import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import {
  RegisterUserDto,
  ResetPasswordDto,
  SignInDto,
  SignInTokens,
  UserBase,
  UserRecord,
  VerifyUserDto
} from '../types/user.types';
import * as jwt from 'jsonwebtoken';
import { ApiConfigService } from '../api-config';
import { MailService } from '../mail-service';
import { PasswordHasher } from './password-hasher';
import { createSignInCredentials } from './create-sign-in-credentials';
import { validatePasswordRules } from './validate-password-rules';
import { TokenPayload } from './jwt-payload.type';
import { DbInsertOptions } from '../db';


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
    const user = await this.dbService.users.findOne({email: registerUserDto.email});
    let userId = user?._id || null;
    if (!userId) {
      userId = await this.dbService.users.insert({
        email: registerUserDto.email,
        isVerified: false,
        isSystemAdmin: false
      });
    }
    const token = jwt.sign({userId}, this.apiConfigService.jwtSigningSecret, {
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
      const message = err.message ?? 'Failed to decode id token for unknown reason';
      this.logger.error(message);
      throw new ForbiddenException(message);
    }

    const user = await this.dbService.users.get(userId);
    if (!user) {
      this.logger.error('Failed to find user');
      throw new ForbiddenException('Invalid Token');
    }
    return user;
  }

  async verifyUser(verifyUserDto: VerifyUserDto): Promise<void> {
    const user = await this.decodeVerificationToken(verifyUserDto.token);
    await this.dbService.users.update(user._id, {isVerified: true});
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SignInTokens> {
    const user = await this.decodeVerificationToken(resetPasswordDto.token);
    validatePasswordRules(resetPasswordDto.password);
    const passwordHash = await PasswordHasher.hash(resetPasswordDto.password);
    await this.dbService.users.update(user._id, {passwordHash, isVerified: true});
    return this.signIn({email: user.email, password: resetPasswordDto.password});
  }

  async setResetPasswordEmail(email: string) {
    const user = await this.dbService.users.findOne({email});
    if (!user) {
      throw new BadRequestException('No user with this email');
    }
    const token = jwt.sign({userId: user._id}, this.apiConfigService.jwtSigningSecret, {
      expiresIn: '1 hour'
    });
    const link = `${this.apiConfigService.clientAddress}/reset-password?token=${token}`;
    await this.mailService.sendResetPasswordEmail(email, link);
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

  async refreshToken(
    refreshToken: string
  ): Promise<SignInTokens> {
    this.logger.debug('refresh-token');
    const user = await this.getUserByToken(refreshToken);
    return await createSignInCredentials(user, this.apiConfigService.jwtSigningSecret);
  }

  async createUser(
    user: UserBase,
    id?: string
  ): Promise<string> {
    let options: DbInsertOptions= null;
    if (id) {
      options = { _id: id };
    }
    return this.dbService.users.insert(user, options);
  }
}
