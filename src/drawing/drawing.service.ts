import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Drawing } from '../models/drawing.schema';

@Injectable()
export class DrawingService {
    constructor(
        @InjectModel(Drawing.name) private drawingModel: Model<Drawing>
    ) {}

    async createDrawing(data: {
        image: string;
        reference: Types.ObjectId;
        user: Types.ObjectId;
        day: Date;
        feedback?: {
            overallScore?: number;
            improvementTips?: string[];
            categoryScores?: any;
            categoryFeedback?: any;
            progressSummary?: string;
        };
    }) {
        try {
            const drawingData = {
                image: data.image,
                reference: data.reference,
                user: data.user,
                day: data.day,
                ...data.feedback && {
                    overallScore: data.feedback.overallScore,
                    improvementTips: data.feedback.improvementTips,
                    categoryScores: data.feedback.categoryScores,
                    categoryFeedback: data.feedback.categoryFeedback,
                    progressSummary: data.feedback.progressSummary
                }
            };

            const drawing = await this.drawingModel.findOneAndUpdate(
                {
                    user: data.user,
                    reference: data.reference,
                    day: data.day
                },
                drawingData,
                { new: true, upsert: true }
            );
            return drawing;
        } catch (error) {
            throw new Error(`Failed to create/update drawing: ${error.message}`);
        }
    }

    async getDrawings(userId: Types.ObjectId, options?: { reference?: Types.ObjectId }) {
        try {
            const query: any = { user: userId };
            if (options?.reference) {
                query.reference = options.reference;
            }

            const drawings = await this.drawingModel
                .find(query)
                .sort({ createdAt: 1 })
                
            return drawings;
        } catch (error) {
            throw new Error(`Failed to fetch drawings: ${error.message}`);
        }
    }
}
