import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './schemas/chat.schema'; // Use the correct schema path

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get all messages
  @Get('/messages')
  async getMessages(): Promise<ChatMessage[]> {
    return this.chatService.getMessages();
  }

  // Get all messages between two users
  @Get('/messages/:sender/:receiver')
  async getMessagesBetweenUsers(
    @Param('sender') sender: string,
    @Param('receiver') receiver: string,
  ): Promise<ChatMessage[]> {
    return this.chatService.getMessagesBetweenUsers(sender, receiver);
  }

  @Get('/chat-users/:userId')
  async getChatUsersForUser(
    @Param('userId') userId: string,
  ): Promise<string[]> {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }
    const chatUsers = await this.chatService.getChatUsersForUser(userId);
    if (!chatUsers) {
      throw new NotFoundException('No chat users found for the given user ID');
    }
    return chatUsers;
  }
}
