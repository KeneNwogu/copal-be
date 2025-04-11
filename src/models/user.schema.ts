import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false, default: null })
  password: string;

  @Prop({ required: false, default: null })
  profilePicture: string;

  @Prop({ required: true })
  signUpMethod: string
}

export const UserSchema = SchemaFactory.createForClass(User);