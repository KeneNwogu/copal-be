import { z } from 'zod';

export const CreateReferenceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    iterations: z.string()
    .transform((v) => Number(v))
    .refine((val) => !isNaN(val) && val > 0, {
        message: 'Iterations must be a valid positive number'
    }),
    // .positive('Iterations must be a positive number'),
    frequency: z.enum(['daily', 'weekly'], {
        errorMap: () => ({ message: 'Frequency must be either "daily" or "weekly"' })
    }),
    goal: z.string().min(1, 'Goal is required')
});

export type CreateReferenceDto = z.infer<typeof CreateReferenceSchema>;