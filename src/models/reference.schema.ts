import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Reference extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  iterations: number;

  @Prop({ required: false, default: 0 })
  completedIterations: number

  @Prop({ required: true, enum: ["daily", "weekly"] })
  frequency: string;

  @Prop({ required: true })
  goal: string

  @Prop({ required: true })
  image: string

  @Prop({ required: true })
  user: Types.ObjectId
}

export const ReferenceSchema = SchemaFactory.createForClass(Reference);