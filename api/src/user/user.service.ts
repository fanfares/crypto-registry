import { Injectable, Logger } from '@nestjs/common';
import { UserCreateDto, UserDto, UserUpdateDto } from '@bcr/types';
import { DbInsertOptions } from '../db';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { MailService } from '../mail-service';

@Injectable()
export class UserService {
  constructor(
    private logger: Logger,
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private mailService: MailService
  ) {
  }

  async getUsers(): Promise<UserDto[]> {
    return this.dbService.users.find({});
  }

  async getUser(id: string) {
    return this.dbService.users.get(id);
  }

  async createUser(
    userCreateDto: UserCreateDto,
    id?: string
  ): Promise<string> {
    let options: DbInsertOptions = null;
    if (id) {
      options = {_id: id};
    }
    return this.dbService.users.insert({
      ...userCreateDto,
      isVerified: false
    }, options);
  }

  async updateUser(
    userId: string,
    update: UserUpdateDto
  ) {
    await this.dbService.users.update(userId, update);
  }

  async deleteUser(
    userId: string
  ) {
    await this.dbService.users.delete(userId);
  }

}
