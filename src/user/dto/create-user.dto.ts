import { z } from 'zod';

// Zod schema for creating a user
export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(3),
    lastName: z.string().min(3),
});

// DTO class generated from the Zod schema
export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const LoginUserSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
