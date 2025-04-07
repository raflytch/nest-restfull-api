import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { Auth } from 'src/common/auth.decorator';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from 'src/model/contact.model';
import { User } from '@prisma/client';
import { WebResponse } from 'src/model/web.model';

@Controller('/api/v1/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post('/create')
  @HttpCode(200)
  async createContactController(
    @Auth() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.createContactService(
      user,
      request,
    );
    return {
      status: 'success',
      message: 'Contact created successfully',
      data: result,
    };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async getContactController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.getContactService(user, contactId);
    return {
      status: 'success',
      message: 'Contact retrieved successfully',
      data: result,
    };
  }

  @Patch('/:contactId')
  @HttpCode(200)
  async updateContactController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    request.id = contactId;
    const result = await this.contactService.updateContactService(
      user,
      request,
    );
    return {
      status: 'success',
      message: 'Contact updated successfully',
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async deleteContactController(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<boolean>> {
    const result = await this.contactService.deleteContactService(
      user,
      contactId,
    );
    return {
      status: 'success',
      message: 'Contact deleted successfully',
      data: true,
    };
  }

  @Get()
  @HttpCode(200)
  async searchContactController(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query(
      'page',
      new ParseIntPipe({
        optional: true,
      }),
    )
    page: number = 1,
    @Query(
      'limit',
      new ParseIntPipe({
        optional: true,
      }),
    )
    limit: number = 10,
  ): Promise<WebResponse<ContactResponse[]>> {
    const hasName = !!name && name.length > 0;
    const hasEmail = !!email && email.length > 0;
    const hasPhone = !!phone && phone.length > 0;

    const request: SearchContactRequest = {
      name: hasName ? name : undefined,
      email: hasEmail ? email : undefined,
      phone: hasPhone ? phone : undefined,
      page,
      limit,
    };

    const result = await this.contactService.searchContactService(
      user,
      request,
    );

    return {
      status: 'success',
      message: 'Contacts retrieved successfully',
      data: result.data,
      paging: result.paging,
    };
  }
}
