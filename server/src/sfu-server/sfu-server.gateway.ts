import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { StudyRoomsService } from '../study-room/study-room.service';
import { ChattingService } from '../chatting/chatting.service';
import { JoinRoomDto } from '../signaling-server/signaling-server.dto';

@WebSocketGateway()
export class SfuServerGateway implements OnGatewayDisconnect {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
    private readonly chattingService: ChattingService,
  ) {}

  @WebSocketServer()
  server: Server;
  peerConnections = {};
  mediaStreams = {};
  rooms = new Map<string, { timer?: NodeJS.Timeout }>();

  async handleDisconnect(client: Socket) {
    const socketId = client.id;
    const roomId = await this.studyRoomsService.findUserRoom(client.id);
    if (roomId === undefined) return;
    await this.studyRoomsService.removeUserFromRoom(roomId, client.id);
    const users = await this.studyRoomsService.getRoomUsers(roomId);

    if (this.peerConnections[socketId]) {
      this.peerConnections[socketId].close();
      delete this.peerConnections[socketId];
    }

    const mediaStreamId = this.mediaStreams[socketId].id;
    if (this.mediaStreams[socketId]) {
      delete this.mediaStreams[socketId];
    }

    for (const userId of users) {
      this.server.to(userId.socketId).emit('removeStream', { mediaStreamId });
    }

    const room = this.rooms.get(roomId);
    if (!users.length) {
      room.timer = setTimeout(
        () => {
          this.rooms.delete(roomId);
          this.studyRoomsService.deleteRoom(roomId);
        },
        5 * 60 * 1000,
      );
    }

    this.logger.info(`${client.id} 접속해제!!!`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() joinRoomDto: JoinRoomDto) {
    const roomId = joinRoomDto.roomId;

    const room = this.rooms.get(roomId);
    if (!room) {
      this.rooms.set(roomId, { timer: null });
    } else {
      if (room.timer) {
        clearTimeout(room.timer);
        room.timer = undefined;
      }
    }
    this.logger.info(`${client.id} 접속, `); //, ${JSON.stringify(users)}
  }
}
