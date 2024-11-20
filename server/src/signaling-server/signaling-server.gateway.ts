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

@WebSocketGateway({ cors: { origin: '*' } })
export class SignalingServerGateway implements OnGatewayDisconnect {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
  ) {}

  @WebSocketServer()
  server: Server;

  // 5. 참가자가 공부방을 나갔을 때 방에 있는 참가자들에게 퇴장인원 소켓 정보를 전달한다
  async handleDisconnect(client: Socket) {
    const roomId = await this.studyRoomsService.findUserRoom(client.id);
    this.studyRoomsService.removeUserFromRoom(roomId, client.id);
    const users = await this.studyRoomsService.getRoomUsers(roomId);
    for (const userId of users) {
      this.server.to(userId.socketId).emit('userDisconnected', { targetId: client.id });
    }
    this.logger.info(`${client.id} 접속해제!!!`);
  }

  // 1. 신규 참가자가 공부방 입장을 요청한다. 그리고 방에 있는 기존 참가자들 소켓 정보를 반환한다.
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody('roomId') roomId: string) {
    const users = await this.studyRoomsService.getRoomUsers(roomId);
    await this.studyRoomsService.addUserToRoom(roomId, client.id);
    client.emit('offerRequest', { users });
    this.logger.info(`${client.id} 접속, [${users}]`);
  }

  // 2. 신규 참가자가 기존 참가자들에게 offer를 보낸다.
  @SubscribeMessage('sendOffer')
  handleSendOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody('offer') offer: RTCSessionDescriptionInit,
    @MessageBody('oldId') oldId: string,
    @MessageBody('newRandomId') newRandomId: string,
  ) {
    this.logger.silly(
      `new user: ${client.id}(${newRandomId}) sends an offer to old user: ${oldId}`,
    );
    this.server.to(oldId).emit('answerRequest', { newId: client.id, offer, newRandomId });
  }

  // 3. 기존 참가자들은 신규 참가자에게 answer를 보낸다.
  @SubscribeMessage('sendAnswer')
  handleSendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody('answer') answer: RTCSessionDescriptionInit,
    @MessageBody('newId') newId: string,
    @MessageBody('oldRandomId') oldRandomId: string,
  ) {
    this.logger.silly(
      `old user: ${client.id}(${oldRandomId}) sends an answer to new user: ${newId}`,
    );
    this.server.to(newId).emit('completeConnection', {
      oldId: client.id,
      answer,
      oldRandomId,
    });
  }

  // 4. 참가자들간에 icecandidate를 주고 받는다.
  @SubscribeMessage('sendIceCandidate')
  handleSendIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody('targetId') targetId: string,
    @MessageBody('iceCandidate') candidate: RTCIceCandidateInit,
  ) {
    this.logger.silly(`user: ${client.id} sends ICE candidate to user: ${targetId}`);
    this.server
      .to(targetId)
      .emit('setIceCandidate', { senderId: client.id, iceCandidate: candidate });
  }
}
