import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
export class ChattingServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    this.logger.info(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.info(`Client disconnected: ${client.id}`);
    await this.studyRoomsService.leaveAllRooms(client.id);
  }

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('message') message: string,
  ) {
    const userRoom = await this.studyRoomsService.findUserRoom(client.id);

    if (!userRoom) {
      this.logger.info(`사용자 ${client.id}가 속한 방이 없습니다.`);
      return;
    }

    this.logger.info(`Message from ${client.id} in room ${userRoom}: ${message}`);
    client.broadcast.to(userRoom).emit('receiveMessage', {
      userId: client.id,
      message,
    });
  }
}
