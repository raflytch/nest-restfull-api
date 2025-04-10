import { HttpException, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { AddressResponse, CreateAddressRequest } from 'src/model/address.model';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
  ) {}

  async createAddressService(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Creating address for user: ${user.username}`);
    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: createRequest.contact_id,
      },
    });

    const address = await this.prismaService.address.create({
      data: createRequest,
    });

    this.logger.debug('Address created successfully', { address });

    return {
      id: address.id,
      street: address.street || '',
      city: address.city || '',
      province: address.province || '',
      country: address.country,
      postal_code: address.postal_code,
    };
  }
}
