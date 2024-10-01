import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface AuthResponse {
  user: UserDocument;
  token: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    name: string,
    email: string,
    password?: string,
  ): Promise<UserDocument> {
    const user = new this.userModel({ name, email, password });
    return user.save();
  }

  async findOrCreateUser(
    facebookId: string,
    name: string,
    email: string,
  ): Promise<UserDocument> {
    let user = await this.userModel.findOne({ facebookId }).exec();

    if (!user) {
      user = new this.userModel({ facebookId, name, email });
      await user.save();
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async updateUser(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async setResetPasswordToken(
    user: UserDocument,
    token: string,
    expires: Date,
  ): Promise<void> {
    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();
  }

  async findByResetPasswordToken(
    token: string,
  ): Promise<UserDocument | undefined> {
    return this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .exec();
  }

  async findByEmailVerificationToken(
    token: string,
  ): Promise<UserDocument | undefined> {
    return this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      })
      .exec();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find();
  }
}
