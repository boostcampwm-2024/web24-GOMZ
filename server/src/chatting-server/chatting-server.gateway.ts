import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SendMessageDto } from './chatting-server.dto';
import { ChattingServerService } from './chatting-server.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChattingServerGateway {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly chattingServerService: ChattingServerService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    const userList = await this.chattingServerService.handleSendMessage(client.id);

    client.broadcast.to(userList).emit('receiveMessage', {
      userId: client.id,
      message: sendMessageDto.message,
    });
  }
}
