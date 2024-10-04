import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  private connectedUsers: { [key: string]: Socket } = {};

  handleConnection(client: Socket) {
    this.connectedUsers[client.id] = client;
  }

  handleDisconnect(client: Socket) {
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

    // Emit the messages back to the client that requested them
    client.emit('loadPreviousMessages', messages);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    client: Socket,
    payload: { receiverId: string; senderId: string; message: string },
  ) {
    try {
      const savedMessage = await this.chatService.saveMessage(
        payload.senderId,
        payload.receiverId,
        payload.message,
      );

      console.log(
        `Message sent from ${payload.senderId} to ${payload.receiverId}: ${payload.message}`,
      );

      client.emit('messageSent', savedMessage);

      const receiverSocket = this.connectedUsers[payload.receiverId];
      if (receiverSocket) {
        receiverSocket.emit('receiveMessage', {
          sender: payload.senderId,
          message: payload.message,
          timestamp: savedMessage.timestamp,
        });
        console.log(
          `Message received by ${payload.receiverId}: ${payload.message}`,
        );
      } else {
        console.warn(`Receiver ${payload.receiverId} is not connected.`);
      }
    } catch (error) {
      console.error('Error handling private message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // Long polling endpoint for previous messages
  @SubscribeMessage('pollPreviousMessages')
  async handlePollPreviousMessages(
    client: Socket,
    payload: { senderId: string; receiverId: string },
  ) {
    const messages = await this.chatService.getMessagesBetweenUsers(
      payload.senderId,
      payload.receiverId,
    );

    // Send the messages to the client
    client.emit('loadPreviousMessages', messages);

    // Poll for new messages every 2 seconds
    setTimeout(() => {
      this.handlePollPreviousMessages(client, payload);
    }, 2000);
  }
}
