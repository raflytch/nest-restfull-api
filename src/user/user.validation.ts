import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(20),
    name: z.string().min(3).max(50),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(20),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(3).max(50).optional(),
    password: z.string().min(6).max(20).optional(),
  });
}
