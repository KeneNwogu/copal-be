import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

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
  ) {}

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
}
