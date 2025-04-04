import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ValidationService {
  validate<T>(zodtype: ZodType<T>, data: T): T {
    return zodtype.parse(data);
  }
}
