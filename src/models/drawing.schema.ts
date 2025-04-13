import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class CategoryScores {
    @Prop({ required: true })
    proportions: number;

    @Prop({ required: true })
    anatomy: number;

    @Prop({ required: true })
    perspective: number;

    @Prop({ required: true })
    shading: number;

    @Prop({ required: true })
    lineQuality: number;

    @Prop({ required: true })
    composition: number;

    @Prop({ required: true })
    likeness: number;
}

@Schema()
export class CategoryFeedback {
    @Prop({ required: true })
    proportions: string;

    @Prop({ required: true })
    anatomy: string;

    @Prop({ required: true })
    perspective: string;

    @Prop({ required: true })
    shading: string;

    @Prop({ required: true })
    lineQuality: string;

    @Prop({ required: true })
    composition: string;

    @Prop({ required: true })
    likeness: string;
}


@Schema({ timestamps: true })
export class Drawing extends Document {
  @Prop({ required: true })
  day: Date;

  @Prop({ required: false })
  overallScore: number

  @Prop({ required: false })
  improvementTips: string[]

  @Prop({ required: false })
  categoryScores: CategoryScores

  @Prop({ required: false })
  categoryFeedback: CategoryFeedback

  @Prop({ required: false })
  progressSummary: string

  @Prop({ required: true })
  image: string

  @Prop({ required: true, ref: "Reference" })
  reference: Types.ObjectId

  @Prop({ required: true })
  user: Types.ObjectId
}

export const DrawingSchema = SchemaFactory.createForClass(Drawing);