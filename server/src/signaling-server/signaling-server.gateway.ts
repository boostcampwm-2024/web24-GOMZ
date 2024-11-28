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
import {
  JoinRoomDto,
  SendAnswerDto,
  SendIceCandidateDto,
  SendOfferDto,
} from './signaling-server.dto';
import { SendMessageDto } from 'src/chatting/chatting.dto';
import { MESSAGE_SENT } from 'src/chatting/chatting.constant';
import { ChattingService } from 'src/chatting/chatting.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class SignalingServerGateway implements OnGatewayDisconnect {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
    private readonly chattingService: ChattingService,
  ) {}

  @WebSocketServer()
  server: Server;
  rooms = new Map<string, { timer?: NodeJS.Timeout }>();

  // 5. 참가자가 공부방을 나갔을 때 방에 있는 참가자들에게 퇴장인원 소켓 정보를 전달한다
  async handleDisconnect(client: Socket) {
    const roomId = await this.studyRoomsService.findUserRoom(client.id);
    if (roomId === undefined) return;
    await this.studyRoomsService.removeUserFromRoom(roomId, client.id);
    const users = await this.studyRoomsService.getRoomUsers(roomId);
    for (const userId of users) {
      this.server.to(userId.socketId).emit('userDisconnected', { targetId: client.id });
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

  // 1. 신규 참가자가 공부방 입장을 요청한다. 그리고 방에 있는 기존 참가자들 소켓 정보를 반환한다.
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() joinRoomDto: JoinRoomDto) {
    const roomId = joinRoomDto.roomId;
    const users = (await this.studyRoomsService.getRoomUsers(roomId)).filter(
      (user) => user.socketId !== client.id,
    );
    await this.studyRoomsService.addUserToRoom(roomId, client.id);

    const room = this.rooms.get(roomId);
    if (!room) {
      this.rooms.set(roomId, { timer: null });
    } else {
      if (room.timer) {
        clearTimeout(room.timer);
        room.timer = undefined;
      }
    }

    client.emit('offerRequest', { users });
    this.logger.info(`${client.id} 접속, ${JSON.stringify(users)}`);
  }

  // 2. 신규 참가자가 기존 참가자들에게 offer를 보낸다.
  @SubscribeMessage('sendOffer')
  handleSendOffer(@ConnectedSocket() client: Socket, @MessageBody() sendOfferDto: SendOfferDto) {
    const { offer, oldId, newRandomId } = sendOfferDto;
    this.logger.silly(
      `new user: ${client.id}(${newRandomId}) sends an offer to old user: ${oldId}`,
    );
    this.server.to(oldId).emit('answerRequest', { newId: client.id, offer, newRandomId });
  }

  // 3. 기존 참가자들은 신규 참가자에게 answer를 보낸다.
  @SubscribeMessage('sendAnswer')
  handleSendAnswer(@ConnectedSocket() client: Socket, @MessageBody() sendAnswerDto: SendAnswerDto) {
    const { answer, newId, oldRandomId } = sendAnswerDto;
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
    @MessageBody() sendIceCandidateDto: SendIceCandidateDto,
  ) {
    const { targetId, iceCandidate } = sendIceCandidateDto;
    this.logger.silly(`user: ${client.id} sends ICE candidate to user: ${targetId}`);
    this.server
      .to(targetId)
      .emit('setIceCandidate', { senderId: client.id, iceCandidate: iceCandidate });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    const { message } = sendMessageDto;
    const clientId = client.id;
    const userList = await this.chattingService.getRoomMemberSocketIdList(clientId);

    this.logger.info(MESSAGE_SENT(clientId, userList, message));
    client.broadcast.to(userList).emit('receiveMessage', {
      userId: clientId,
      message: message,
    });
  }
}
