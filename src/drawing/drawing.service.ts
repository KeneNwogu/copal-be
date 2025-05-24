import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Drawing } from '../models/drawing.schema';
import { User } from '../models/user.schema';
import { differenceInDays } from 'date-fns';

@Injectable()
export class DrawingService {
    constructor(
        @InjectModel(Drawing.name) private readonly drawingModel: Model<Drawing>,
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) { }

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

            // calculate streaks for user
            // get latest drawing previously uploaded
            const latestDrawing = await this.drawingModel.findOne({ user: data.user, day: { $ne: data.day } })
                .sort({ _id: -1 });

            const user = await this.userModel.findById(data.user);

            let currentStreak = (user.currentStreak || 0) + 1;
            let maxStreaksObtained = user.maxStreaksObtained || 0;
            
            if (latestDrawing && differenceInDays(data.day, latestDrawing.day) == 1) {
                await user.updateOne({
                    $inc: {
                        currentStreak: 1
                    },
                    $set: {
                        maxStreaksObtained: currentStreak > maxStreaksObtained ? currentStreak : maxStreaksObtained
                    }
                })
            }

            else {
                // set streak to 1
                await user.updateOne({
                    $set: {
                        currentStreak: 1,
                        maxStreaksObtained: maxStreaksObtained > 1 ? maxStreaksObtained : 1
                    }
                })
            }

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
