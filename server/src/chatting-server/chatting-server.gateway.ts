import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
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

  // 신규 참가자가 접속을 요청한다.
  // 현재는 signalling-server, chatting-server 연결 시 소켓을 분리하여 생각하고 있습니다.
  handleConnection(client: Socket) {
    this.logger.info(`${client.id} 접속!`);
  }

  // 사용자가 접속을 해제했을 때
  handleDisconnect(client: Socket) {
    this.logger.info(`${client.id} 접속 해제!`);
    this.studyRoomsService.leaveAllRooms(client.id);
  }

  // 특정 방에 참가 요청을 받음
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody('room') roomId: string) {
    const room = this.studyRoomsService.findRoom(roomId);

    if (!room) {
      // 방이 존재하지 않으면 생성
      this.studyRoomsService.createRoom(roomId);
    }

    client.join(roomId);
    this.studyRoomsService.addUserToRoom(roomId, client.id);
    this.logger.info(`${client.id}님이 방 ${roomId}에 입장했습니다.`);

    // 방에 있는 다른 사용자들에게 알림
    this.server.to(roomId).emit('userJoined', JSON.stringify({ userId: client.id }));
  }

  // 특정 방에서 퇴장 요청을 받음
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody('room') roomId: string) {
    client.leave(roomId);
    this.studyRoomsService.removeUserFromRoom(roomId, client.id);
    this.logger.info(`${client.id}님이 방 ${roomId}에서 나갔습니다.`);

    // 방에 있는 다른 사용자들에게 알림
    this.server.to(roomId).emit('userLeft', JSON.stringify({ userId: client.id }));
  }

  // 메시지 전송
  @SubscribeMessage('sendMessage')
  handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody('message') message: string) {
    const userRoom = this.studyRoomsService.findUserRoom(client.id);
    if (!userRoom) {
      this.logger.info(`사용자 ${client.id}가 속한 방이 없습니다.`);
      return;
    }

    client.broadcast.to(userRoom).emit('receiveMessage', {
      userId: client.id,
      message,
    });
  }
}
