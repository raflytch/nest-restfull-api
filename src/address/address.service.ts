import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Address, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  ListAddressRequest,
  UpdateAddressRequest,
} from 'src/model/address.model';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';
import { WebResponse } from 'src/model/web.model';

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

    return this.toAddressResponse(address);
  }

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      street: address.street || '',
      city: address.city || '',
      province: address.province || '',
      country: address.country,
      postal_code: address.postal_code,
    };
  }

  async getAddressService(
    user: User,
    request: GetAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Getting address for user: ${user.username}`);

    const getRequest: GetAddressRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: getRequest.contact_id,
      },
    });

    const address = await this.prismaService.address.findFirst({
      where: {
        id: getRequest.address_id,
        contact_id: getRequest.contact_id,
      },
    });

    if (!address) {
      this.logger.error(`Address with id ${getRequest.address_id} not found`);
      throw new HttpException('Address not found', 404);
    }

    this.logger.debug('Address retrieved successfully', { address });

    return this.toAddressResponse(address);
  }

  async updateAddressService(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Updating address for user: ${user.username}`);

    const updateRequest: UpdateAddressRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );

    await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: updateRequest.contact_id,
      },
    });

    let address = await this.prismaService.address.findFirst({
      where: {
        id: updateRequest.id,
        contact_id: updateRequest.contact_id,
      },
    });

    if (!address) {
      this.logger.error(`Address with id ${updateRequest.id} not found`);
      throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
    }

    address = await this.prismaService.address.update({
      where: {
        id: updateRequest.id,
      },
      data: updateRequest,
    });

    this.logger.debug('Address updated successfully', { address });

    return this.toAddressResponse(address);
  }

  async deleteAddressService(
    user: User,
    contactId: number,
    addressId: number,
  ): Promise<boolean> {
    this.logger.info(`Deleting address for user: ${user.username}`);

    await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: contactId,
      },
    });

    const address = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });

    if (!address) {
      this.logger.error(`Address with id ${addressId} not found`);
      throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
    }

    await this.prismaService.address.delete({
      where: {
        id: addressId,
      },
    });

    this.logger.debug('Address deleted successfully', { addressId });

    return true;
  }

  async getAddressListService(
    user: User,
    request: ListAddressRequest,
  ): Promise<WebResponse<AddressResponse[]>> {
    this.logger.info(`Getting address list for user: ${user.username}`);

    const listRequest: ListAddressRequest = this.validationService.validate(
      AddressValidation.LIST,
      request,
    );

    await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: listRequest.contact_id,
      },
    });

    const addresses = await this.prismaService.address.findMany({
      where: {
        contact_id: listRequest.contact_id,
      },
      skip: (listRequest.page - 1) * listRequest.limit,
      take: listRequest.limit,
    });

    const total = await this.prismaService.address.count({
      where: {
        contact_id: listRequest.contact_id,
      },
    });

    const totalPages = Math.ceil(total / listRequest.limit);

    this.logger.debug('Address list retrieved successfully', {
      addresses,
      total,
      totalPages,
    });

    return {
      status: 'success',
      message: 'Address list retrieved successfully',
      data: addresses.map((address) => this.toAddressResponse(address)),
      paging: {
        total_page: totalPages,
        page: listRequest.page,
        limit: listRequest.limit,
      },
    };
  }
}
