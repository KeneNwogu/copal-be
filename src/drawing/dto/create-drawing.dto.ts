import { z } from 'zod';
import { Types } from 'mongoose';

export const createDrawingSchema = z.object({
    reference: z.string().refine(
        (val) => Types.ObjectId.isValid(val),
        { message: 'Invalid reference ID format' }
    )
});

export type CreateDrawingDto = z.infer<typeof createDrawingSchema>;