import { HttpException, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from 'src/model/contact.model';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';
import { WebResponse } from 'src/model/web.model';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async createContactService(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.info(`Creating contact for user: ${user.username}`);

    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    const contact = await this.prismaService.contact.create({
      data: {
        ...createRequest,
        ...{ username: user.username },
      },
    });

    this.logger.debug(
      `Contact created successfully: ${JSON.stringify(contact)}`,
    );

    return {
      id: contact.id,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
    };
  }

  async getContactService(
    user: User,
    contactId: number,
  ): Promise<ContactResponse> {
    this.logger.info(`Getting contact for user: ${user.username}`);

    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: contactId,
      },
    });

    if (!contact) {
      this.logger.error(`Contact with id ${contactId} not found`);
      throw new HttpException('Contact not found', 404);
    }

    this.logger.debug(
      `Contact retrieved successfully: ${JSON.stringify(contact)}`,
    );

    return {
      id: contact.id,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
    };
  }

  async updateContactService(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.info(`Updating contact for user: ${user.username}`);

    const updateRequest: UpdateContactRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: updateRequest.id,
      },
    });

    if (!contact) {
      this.logger.error(`Contact with id ${updateRequest.id} not found`);
      throw new HttpException('Contact not found', 404);
    }

    const updatedContact = await this.prismaService.contact.update({
      where: {
        id: contact.id,
        username: user.username,
      },
      data: {
        ...updateRequest,
      },
    });

    this.logger.debug(
      `Contact updated successfully: ${JSON.stringify(updatedContact)}`,
    );

    return {
      id: updatedContact.id,
      first_name: updatedContact.first_name || '',
      last_name: updatedContact.last_name || '',
      email: updatedContact.email || '',
      phone: updatedContact.phone || '',
    };
  }

  async deleteContactService(
    user: User,
    contactId: number,
  ): Promise<ContactResponse> {
    this.logger.info(`Deleting contact for user: ${user.username}`);

    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: user.username,
        id: contactId,
      },
    });

    if (!contact) {
      this.logger.error(`Contact with id ${contactId} not found`);
      throw new HttpException('Contact not found', 404);
    }

    const deletedContact = await this.prismaService.contact.delete({
      where: {
        id: contact.id,
        username: user.username,
      },
    });

    this.logger.debug(
      `Contact deleted successfully: ${JSON.stringify(deletedContact)}`,
    );

    return {
      id: deletedContact.id,
      first_name: deletedContact.first_name || '',
      last_name: deletedContact.last_name || '',
      email: deletedContact.email || '',
      phone: deletedContact.phone || '',
    };
  }

  async searchContactService(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    this.logger.info(`Searching contacts for user: ${user.username}`);
    const searchRequest: SearchContactRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters: any[] = [];

    if (searchRequest.name) {
      const name = searchRequest.name.toLowerCase();
      filters.push({
        OR: [
          {
            first_name: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            last_name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (searchRequest.email) {
      filters.push({
        email: {
          contains: searchRequest.email,
          mode: 'insensitive',
        },
      });
    }

    if (searchRequest.phone) {
      filters.push({
        phone: {
          contains: searchRequest.phone,
          mode: 'insensitive',
        },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.limit;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filters,
      },
      skip: skip,
      take: searchRequest.limit,
    });

    const total = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filters,
      },
    });

    return {
      status: 'success',
      message: 'Contacts retrieved successfully',
      data: contacts.map((contact) => ({
        id: contact.id,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
      })),
      paging: {
        page: searchRequest.page,
        limit: searchRequest.limit,
        total_page: Math.ceil(total / searchRequest.limit),
      },
    };
  }
}
