import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { GuardsModule } from './guards/guards.module';
import { ReferenceModule } from './reference/reference.module';
import { DrawingModule } from './drawing/drawing.module';

config()

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    GuardsModule,
    ReferenceModule,
    DrawingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
