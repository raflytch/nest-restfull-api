import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { Auth } from 'src/common/auth.decorator';
import { ContactResponse, CreateContactRequest } from 'src/model/contact.model';
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
}
