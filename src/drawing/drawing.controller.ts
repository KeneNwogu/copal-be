import { Controller, Post, Get, UploadedFile, UseInterceptors, Body, Inject, Req, Query, BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../config/cloudinary.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { createDrawingSchema, CreateDrawingDto } from './dto/create-drawing.dto';
import { getCurrentDayStart } from '../utils/date.utils';
import { GeminiService } from '../config/gemini.service';
import { ReferenceService } from '../reference/reference.service';
import { DrawingService } from './drawing.service';
import { Types } from 'mongoose';
import { AuthGuard } from '../guards/auth.guard';

@Controller('drawings')
export class DrawingController {
  @Inject(DrawingService)
  private readonly drawingService: DrawingService

  @Inject(CloudinaryService)
  private readonly cloudinaryService: CloudinaryService;

  @Inject(GeminiService)
  private readonly geminiService: GeminiService;

  @Inject(ReferenceService)
  private readonly referenceService: ReferenceService;

  @Get('')
  @UseGuards(AuthGuard)
  async getDrawings(@Req() req: any, @Query('reference') reference?: string) {
    const query: any = {};
    if (reference) {
      if(!Types.ObjectId.isValid(reference)) throw new BadRequestException("invalid reference id");
      query.reference = new Types.ObjectId(reference);
    }
    const drawings = await this.drawingService.getDrawings(req.user._id, query);
    return { drawings };
  }

  @Post('')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async createDrawing(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(createDrawingSchema)) body: CreateDrawingDto
  ) {
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    const day = getCurrentDayStart();

    const reference = await this.referenceService.getReferenceById(body.reference, req.user._id);
    if (!reference) throw new NotFoundException("reference not found");
    const feedback = await this.geminiService.generateDrawingRating(imageUrl, reference.image);

    return await this.drawingService.createDrawing({
      image: imageUrl,
      reference: reference._id as Types.ObjectId,
      user: req.user._id,
      day,
      feedback
    });
  }
}
