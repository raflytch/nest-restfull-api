import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    contact_id: z.number().int().positive(),
    street: z.string().min(3).max(50).optional(),
    city: z.string().min(3).max(50).optional(),
    province: z.string().min(3).max(50).optional(),
    country: z.string().min(3).max(50),
    postal_code: z.string().min(3).max(50),
  });
}
