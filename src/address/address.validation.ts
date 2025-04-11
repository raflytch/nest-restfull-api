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

  static readonly GET: ZodType = z.object({
    contact_id: z.number().int().positive(),
    address_id: z.number().int().positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().int().positive(),
    contact_id: z.number().int().positive(),
    street: z.string().min(3).max(50).optional(),
    city: z.string().min(3).max(50).optional(),
    province: z.string().min(3).max(50).optional(),
    country: z.string().min(3).max(50).optional(),
    postal_code: z.string().min(3).max(50).optional(),
  });

  static readonly LIST: ZodType = z.object({
    contact_id: z.number().int().positive(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
  });
}
