import { z, ZodType } from 'zod';

export class ContactValidation {
  static readonly CREATE: ZodType = z.object({
    first_name: z.string().min(3).max(50),
    last_name: z.string().min(3).max(50).optional(),
    email: z.string().min(5).max(50).email().optional(),
    phone: z.string().min(10).max(15).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().int().positive(),
    first_name: z.string().min(3).max(50),
    last_name: z.string().min(3).max(50).optional(),
    email: z.string().min(5).max(50).email().optional(),
    phone: z.string().min(10).max(15).optional(),
  });
  static readonly SEARCH: ZodType = z.object({
    name: z.string().min(3).max(50).optional(),
    email: z.string().min(5).max(50).optional(),
    phone: z.string().min(10).max(15).optional(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
  });
}
