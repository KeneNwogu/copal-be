import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { GoogleAuthService } from '../config/google-auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
    GuardsModule
  ],
  providers: [UserService, GoogleAuthService],
  controllers: [UserController]
})
export class UserModule {}
