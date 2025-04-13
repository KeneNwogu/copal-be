import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { config } from 'dotenv';
import { GuardsService } from './guards.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';

config();

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [AuthGuard, GuardsService],
  exports: [AuthGuard, GuardsService],
})
export class GuardsModule {}
