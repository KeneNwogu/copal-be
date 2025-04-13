import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reference } from '../models/reference.schema';
import { CloudinaryService } from '../config/cloudinary.service';

@Injectable()
export class ReferenceService {
    constructor(
        @InjectModel(Reference.name) private referenceModel: Model<Reference>,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async createReference(referenceData: {
        name: string;
        iterations: number;
        frequency: "daily" | "weekly";
        goal: string;
        user: Types.ObjectId
    }, file: Express.Multer.File) {
        try {
            const imageUrl = await this.cloudinaryService.uploadImage(file);
            return await this.referenceModel.create({
                ...referenceData,
                image: imageUrl
            });
        } catch (error) {
            if (error.code === 11000) {
                throw new BadRequestException('Reference with this name already exists');
            }
            throw new BadRequestException('Failed to create reference');
        }
    }

    async findAll(userId: Types.ObjectId, options: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;

        try {
            const [references, total] = await Promise.all([
                this.referenceModel
                    .find({ user: userId })
                    .sort({ [sortBy]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.referenceModel.countDocuments({ user: userId })
            ]);

            return {
                references,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new BadRequestException('Failed to fetch references');
        }
    }

    async getReferenceById(referenceId: string, userId: Types.ObjectId) {
        if (!Types.ObjectId.isValid(referenceId)) {
            return null;
        }

        return await this.referenceModel.findOne({
            _id: new Types.ObjectId(referenceId),
            user: userId
        });
    }
}
