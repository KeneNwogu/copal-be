import { Module } from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { DrawingController } from './drawing.controller';
import { CloudinaryService } from '../config/cloudinary.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Drawing, DrawingSchema } from '../models/drawing.schema';
import { GuardsModule } from '../guards/guards.module';
import { GeminiService } from '../config/gemini.service';
import { ReferenceModule } from '../reference/reference.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Drawing.name, schema: DrawingSchema}
    ]),
    GuardsModule,
    ReferenceModule
  ],
  providers: [DrawingService, CloudinaryService, GeminiService],
  controllers: [DrawingController]
})
export class DrawingModule {}
