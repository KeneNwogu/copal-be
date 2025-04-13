import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reference, ReferenceSchema } from '../models/reference.schema';
import { ReferenceService } from './reference.service';
import { ReferenceController } from './reference.controller';
import { CloudinaryService } from '../config/cloudinary.service';
import { GuardsModule } from '../guards/guards.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Reference.name, schema: ReferenceSchema}
        ]),
        GuardsModule
    ],
    providers: [ReferenceService, CloudinaryService],
    controllers: [ReferenceController],
    exports: [ReferenceService]
})
export class ReferenceModule {}
