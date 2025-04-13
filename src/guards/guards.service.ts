import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';

@Injectable()
export class GuardsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    return await this.userModel.findById(userId);
  }
}
