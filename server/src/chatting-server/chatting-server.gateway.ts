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
import { MESSAGE_SENT } from './chatting-server.constant';

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
    const { message } = sendMessageDto;
    const clientId = client.id;
    const userList = await this.chattingServerService.handleSendMessage(clientId);

    this.logger.info(MESSAGE_SENT(clientId, userList, message));
    client.broadcast.to(userList).emit('receiveMessage', {
      userId: clientId,
      message: message,
    });
  }
}
