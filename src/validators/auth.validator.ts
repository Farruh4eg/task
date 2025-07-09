import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long'),
    first_name: z.string({ required_error: 'First name is required' }).min(1),
    last_name: z.string({ required_error: 'Last name is required' }).min(1),
    patronymic: z.string().optional(),
    birth_date: z.string({ required_error: 'Birth date is required' }).datetime()
        .refine((date) => new Date(date) <= new Date(), {
            message: 'Birth date cannot be in the future.',
        })
});

export const loginSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(1),
});

export const tokenSchema = z.object({
    refreshToken: z.string({ required_error: 'refreshToken is required' }),
});

export type RegisterUserInput = z.infer<typeof registerSchema>;
export type LoginUserInput = z.infer<typeof loginSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;