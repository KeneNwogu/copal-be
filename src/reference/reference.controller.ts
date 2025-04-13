import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { CreateReferenceSchema, CreateReferenceDto } from './dto/create-reference.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReferenceService } from './reference.service';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../guards/auth.guard';

@Controller('references')
export class ReferenceController {
    constructor(private readonly referenceService: ReferenceService) {}

    @Get('/')
    @UseGuards(AuthGuard)
    async findAll(
        @Req() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc'
    ) {
        try {
            return await this.referenceService.findAll(req.user._id, {
                page,
                limit,
                sortBy,
                sortOrder
            });
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('/')
    @UseInterceptors(FileInterceptor('image', {
        storage: memoryStorage(),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new BadRequestException('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        }
    }))
    @UseGuards(AuthGuard)
    async createReference(
        @UploadedFile() file: Express.Multer.File,
        @Body(new ZodValidationPipe(CreateReferenceSchema)) referenceData: any,
        @Req() req: any
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        try {
            // const userId = new Types.ObjectId(referenceData.user);
            return await this.referenceService.createReference(
                { ...referenceData, user: req.user._id },
                file
            );
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
