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

  async getChatUsersForUser(userId: string): Promise<string[]> {
    const messages = await this.chatMessageModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
      .exec();

    const userIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.sender !== userId) userIds.add(msg.sender);
      if (msg.receiver !== userId) userIds.add(msg.receiver);
    });

    return Array.from(userIds);
  }
}
