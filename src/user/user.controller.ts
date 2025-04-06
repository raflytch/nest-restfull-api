import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';

@Controller('/api/v1/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
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
}
