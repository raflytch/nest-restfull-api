import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async registerUserService(
    request: RegisterUserRequest,
  ): Promise<UserResponse> {
    this.logger.info(`Registering new user ${JSON.stringify(request)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUserWithSameUsername !== 0) {
      this.logger.error(
        `User with username ${registerRequest.username} already exists`,
      );
      throw new HttpException('User already exists', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        username: registerRequest.username,
        password: registerRequest.password,
        name: registerRequest.name,
      },
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async lgoinUserService(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`Logging in user ${JSON.stringify(request)}`);
    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      this.logger.error(
        `User with username ${loginRequest.username} not found`,
      );
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.error(`Invalid password for user ${loginRequest.username}`);
      throw new HttpException('Invalid password', 401);
    }

    user = await this.prismaService.user.update({
      where: {
        username: loginRequest.username,
      },
      data: {
        token: uuid(),
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token ? user.token : undefined,
    };
  }

  async getUserService(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name,
    };
  }

  async updateUserService(
    user: User,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    this.logger.debug(`Updating user ${JSON.stringify(request)}`);
    const updateRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    if (updateRequest.name) {
      user.name = updateRequest.name;
    }
    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        name: user.name,
        password: user.password,
      },
    });

    return {
      username: updatedUser.username,
      name: updatedUser.name,
    };
  }

  async logoutUserService(user: User): Promise<UserResponse> {
    this.logger.debug(`Logging out user ${user.username}`);
    const updatedUser = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: null,
      },
    });

    return {
      username: updatedUser.username,
      name: updatedUser.name,
    };
  }
}
