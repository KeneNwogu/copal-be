import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../models/user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Reference } from '../models/reference.schema';
import { Drawing } from '../models/drawing.schema';

interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  profilePicture?: string;
  signUpMethod: "google" | "password";
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Drawing.name) private readonly drawingModel: Model<Drawing>,
    @InjectModel(Reference.name) private readonly referenceModel: Model<Reference>
  ) { }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...userData } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = new this.userModel({
      ...userData,
      email,
      password: password ? await bcrypt.hash(password, 10) : null
    });

    return user.save();
  }

  generateToken(user: User): string {
    const payload = {
      sub: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
  }

  async loginUser(email: string, password: string): Promise<{user: User, token: string}> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if(!user.password) throw new BadRequestException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {user, token}; 
  }

  async countDrawingsForUser(user: Types.ObjectId): Promise<number> {
    return this.drawingModel.countDocuments({ user });
  }

  async findLatestDrawingForUser(user: Types.ObjectId): Promise<Drawing & { createdAt?: Date }> {
    return await this.drawingModel.findOne({ user })
      .sort({ createdAt: -1 });
  }

  async countReferencesByUser(user: Types.ObjectId): Promise<number> {
    return this.referenceModel.countDocuments({ user });
  }

  async findLatestReferenceForUser(user: Types.ObjectId): Promise<Reference & { createdAt?: Date }> {
    return await this.referenceModel.findOne({ user })
      .sort({ createdAt: -1 });
  }
}
