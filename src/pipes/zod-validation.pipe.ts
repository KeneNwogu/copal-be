import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown, metadata: ArgumentMetadata) {
        try {
            const result = this.schema.parse(value);
            return result;
        } catch (error) {
            const formattedErrors = error.errors.reduce((acc, err) => {
                const path = err.path.join('.');
                acc[path] = acc[path] || [];
                acc[path].push(err.message);
                return acc;
              }, {} as Record<string, string[]>);
      
            throw new BadRequestException(formattedErrors);
        }
    }
}