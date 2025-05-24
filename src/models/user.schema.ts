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

  @Prop({ default: 0 })
  currentStreak: number

  @Prop({ default: 0 })
  maxStreaksObtained: 0
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: function(_, ret) {
    delete ret.password;
    return ret;
  }
});
