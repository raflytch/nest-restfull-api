import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { Auth } from 'src/common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/v1/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  @HttpCode(200)
  async registerUserController(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const user = await this.userService.registerUserService(request);
    return {
      status: 'success',
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async loginUserController(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const user = await this.userService.lgoinUserService(request);
    return {
      status: 'success',
      message: 'User logged in successfully',
      data: user,
    };
  }

  @Get('/me')
  @HttpCode(200)
  async getUserController(
    @Auth() user: User,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.getUserService(user);
    return {
      status: 'success',
      message: 'User retrieved successfully',
      data: result,
    };
  }

  @Patch('/me')
  @HttpCode(200)
  async updateUserController(
    @Auth() user: User,
    @Body() request: UpdateUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.updateUserService(user, request);
    return {
      status: 'success',
      message: 'User updated successfully',
      data: result,
    };
  }

  @Delete('/me/logout')
  @HttpCode(200)
  async logoutUserController(
    @Auth() user: User,
  ): Promise<WebResponse<boolean>> {
    await this.userService.logoutUserService(user);
    return {
      status: 'success',
      message: 'User logged out successfully',
      data: true,
    };
  }
}
