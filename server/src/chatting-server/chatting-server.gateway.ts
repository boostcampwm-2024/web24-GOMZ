import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StudyRoomsService } from '../study-room/study-room.service';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChattingServerGateway {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
  ) {}

  @WebSocketServer()
  server: Server;

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('message') message: string,
  ) {
    const roomId = await this.studyRoomsService.findUserRoom(client.id);

    if (!roomId) {
      this.logger.info(`사용자 ${client.id}가 속한 방이 없습니다.`);
      return;
    }

    const users = await this.studyRoomsService.getRoomUsers(roomId);
    const userList = users.map((user) => user.socketId);

    this.logger.info(`Message from ${client.id} in room ${userList}: ${message}`);
    client.broadcast.to(userList).emit('receiveMessage', {
      userId: client.id,
      message,
    });
  }
}
