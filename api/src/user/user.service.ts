import { Injectable, Logger } from '@nestjs/common';
import { UserCreateDto, UserDto, UserRecord, UserUpdateDto } from '@bcr/types';
import { DbInsertOptions } from '../db';
import { DbService } from '../db/db.service';
import { getUniqueIds } from '../utils';

@Injectable()
export class UserService {
  constructor(
    private logger: Logger,
    private dbService: DbService
  ) {
  }

  async getUsers(): Promise<UserDto[]> {
    const users = await this.dbService.users.find({});
    return await this.getUserDtos(users);
  }

  public async getUserDtos(users: UserRecord[]) {
    const exchangeIds = getUniqueIds('exchangeId', users);
    const exchanges = await this.dbService.exchanges.findByIds(exchangeIds);
    return users.map(u => {
      const exchange = exchanges.find(e => e._id === u.exchangeId);
      return {
        ...u,
        exchangeName: exchange.name
      };
    });
  }

  async getUserDto(id: string): Promise<UserDto> {
    const user = await this.dbService.users.get(id);
    return this.getUserDtos([user])[0];
  }

  async createUser(
    userCreateDto: UserCreateDto,
    id?: string
  ): Promise<string> {
    this.logger.log('create user', userCreateDto);
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
    userUpdateDto: UserUpdateDto
  ) {
    this.logger.log('update user', userUpdateDto);
    await this.dbService.users.update(userId, userUpdateDto);
  }

  async deleteUser(
    userId: string
  ) {
    this.logger.log('delete user: ' + userId);
    await this.dbService.users.delete(userId);
  }

}
