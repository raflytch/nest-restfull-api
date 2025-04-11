import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from 'src/common/auth.decorator';
import { User } from '@prisma/client';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  ListAddressRequest,
  UpdateAddressRequest,
} from 'src/model/address.model';
import { WebResponse } from 'src/model/web.model';

@Controller('/api/v1/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async createAddressController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    request.contact_id = contactId;
    const result = await this.addressService.createAddressService(
      user,
      request,
    );

    return {
      status: 'success',
      message: 'Address created successfully',
      data: result,
    };
  }

  @Get('/:addressId')
  @HttpCode(HttpStatus.OK)
  async getAddressController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponse>> {
    const request: GetAddressRequest = {
      contact_id: contactId,
      address_id: addressId,
    };

    const result = await this.addressService.getAddressService(user, request);

    return {
      status: 'success',
      message: 'Address retrieved successfully',
      data: result,
    };
  }

  @Patch('/:addressId')
  @HttpCode(HttpStatus.OK)
  async updateAddressController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() request: UpdateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    request.contact_id = contactId;
    request.id = addressId;
    const result = await this.addressService.updateAddressService(
      user,
      request,
    );

    return {
      status: 'success',
      message: 'Address updated successfully',
      data: result,
    };
  }

  @Delete('/:addressId')
  @HttpCode(HttpStatus.OK)
  async deleteAddressController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<boolean>> {
    const result = await this.addressService.deleteAddressService(
      user,
      contactId,
      addressId,
    );

    return {
      status: 'success',
      message: 'Address deleted successfully',
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllAddressController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<WebResponse<AddressResponse[]>> {
    const request: ListAddressRequest = {
      contact_id: contactId,
      page: page,
      limit: limit,
    };

    const result = await this.addressService.getAddressListService(
      user,
      request,
    );

    return result;
  }
}
