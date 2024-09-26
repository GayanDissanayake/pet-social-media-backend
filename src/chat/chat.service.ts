import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
  ) {}

  async saveMessage(
    sender: string,
    receiver: string,
    message: string,
  ): Promise<ChatMessage> {
    const newMessage = new this.chatMessageModel({ sender, receiver, message });
    return newMessage.save();
  }

  async getMessages(): Promise<ChatMessage[]> {
    return this.chatMessageModel.find().exec();
  }

  async getMessagesBetweenUsers(
    sender: string,
    receiver: string,
  ): Promise<ChatMessage[]> {
    return this.chatMessageModel
      .find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      })
      .sort({ timestamp: 1 })
      .exec(); // Sorting by timestamp to ensure order
  }
}
