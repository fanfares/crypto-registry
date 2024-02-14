import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceIdDto, CreateUserDto, UserDto, UserRecord, UpdateUserDto } from '@bcr/types';
import { UserService } from './user.service';
import { IsSystemAdminGuard, User } from '../auth';

@Controller('user')
@ApiTags('user')
@UseGuards(IsSystemAdminGuard)
export class UserController {

  constructor(
    private userService: UserService
  ) {
  }

  @Get()
  @ApiResponse({type: UserDto, isArray: true})
  async getUsers(): Promise<UserDto[]> {
    return await this.userService.getUsers();
  }

  @Get(':userId')
  @ApiResponse({type: UserDto})
  async getUser(
    @Param('userId') userId: string
  ): Promise<UserDto> {
    return await this.userService.getUserDto(userId);
  }

  @Post()
  @ApiResponse({type: ResourceIdDto})
  @ApiBody({type: CreateUserDto})
  async createUser(
    @Body() userCreateDto: CreateUserDto
  ): Promise<ResourceIdDto> {
    return {id: await this.userService.createUser(userCreateDto)};
  }

  @Patch(':userId')
  @ApiBody({type: UpdateUserDto})
  async updateUser(
    @Body() updateDto: UpdateUserDto,
    @Param('userId') userId: string
  ): Promise<void> {
    try {
      await this.userService.updateUser(userId, updateDto);
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  @Delete(':userId')
  async deleteUser(
    @User() user: UserRecord,
    @Param('userId') userId: string
  ): Promise<void> {
    if (user._id === userId) {
      throw new BadRequestException('You cannot delete yourself');
    }
    await this.userService.deleteUser(userId);
  }
}
