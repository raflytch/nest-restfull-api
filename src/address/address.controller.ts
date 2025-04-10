import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from 'src/common/auth.decorator';
import { User } from '@prisma/client';
import { AddressResponse, CreateAddressRequest } from 'src/model/address.model';
import { WebResponse } from 'src/model/web.model';

@Controller('/api/v1/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('/create')
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
}
