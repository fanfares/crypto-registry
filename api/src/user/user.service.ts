import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserDto, UserRecord } from '@bcr/types';
import { DbInsertOptions } from '../db';
import { DbService } from '../db/db.service';
import { getUniqueIds } from '../utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
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
        exchangeName: exchange?.name
      };
    });
  }

  async getUserDto(id: string): Promise<UserDto> {
    const user = await this.dbService.users.get(id);
    return (await this.getUserDtos([user]))[0];
  }

  async createUser(
    userCreateDto: CreateUserDto,
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
    userUpdateDto: UpdateUserDto
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
