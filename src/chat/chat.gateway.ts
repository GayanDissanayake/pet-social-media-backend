import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service'; // Import ChatService

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {} // Add constructor to inject ChatService
  private connectedUsers: { [key: string]: Socket } = {};

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
    this.connectedUsers[client.id] = client;
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
    delete this.connectedUsers[client.id];
  }

  @SubscribeMessage('loadMessages')
  async handleLoadMessages(
    client: Socket,
    payload: { receiverId: string; senderId: string },
  ) {
    const messages = await this.chatService.getMessagesBetweenUsers(
      payload.senderId,
      payload.receiverId,
    );

    client.emit('loadPreviousMessages', messages);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    client: Socket,
    payload: { receiverId: string; senderId: string; message: string },
  ) {
    // Save message to the database first
    const savedMessage = await this.chatService.saveMessage(
      payload.senderId,
      payload.receiverId,
      payload.message,
    );

    // Always emit messageSent to the sender, confirming that the message is saved
    client.emit('messageSent', savedMessage);

    const receiverSocket = this.connectedUsers[payload.receiverId];
    if (receiverSocket) {
      // Emit to the receiver if they are connected
      receiverSocket.emit('receiveMessage', {
        sender: payload.senderId,
        message: payload.message,
        timestamp: savedMessage.timestamp,
      });
    }
  }
}
