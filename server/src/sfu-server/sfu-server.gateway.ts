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
import { JoinRoomDto } from '../signaling-server/signaling-server.dto';
import { SfuServerService } from './sfu-server.service';
import { SendMessageDto } from 'src/chatting/chatting.dto';
import { MESSAGE_SENT } from 'src/chatting/chatting.constant';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/sfu' })
export class SfuServerGateway implements OnGatewayDisconnect {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly sfuServerService: SfuServerService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket) {
    const socketId = client.id;
    const { socketIdList, mediaStreamId } = await this.sfuServerService.exitRoom(socketId);
    this.logger.info(`${socketId}이 SFU 방에서 나갔습니다.`);
    this.server.to(socketIdList).emit('userDisconnected', { targetId: socketId, mediaStreamId });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() joinRoomDto: JoinRoomDto) {
    const { roomId } = joinRoomDto;
    const socketId = client.id;
    const { users } = await this.sfuServerService.enterRoom(socketId, roomId);

    this.logger.info(`${socketId} 접속, ${JSON.stringify(users)}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    const { message } = sendMessageDto;
    const clientId = client.id;
    const userList = await this.sfuServerService.getRoomMemberSocketIdList(clientId);

    this.logger.info(MESSAGE_SENT(clientId, userList, message));
    client.broadcast.to(userList).emit('receiveMessage', {
      userId: clientId,
      message: message,
    });
  }

  @SubscribeMessage('offer')
  async offer(@ConnectedSocket() client: Socket, @MessageBody() offer: RTCSessionDescriptionInit) {
    // 1. peerConnection 작성
    // 2. peerConnectionList에 저장
    // 3. peerConnection에 onIceCandidate, ontrack 이벤트 지정(mediaStreams에 저장)
    // 4. sendAnswer
    const { peerConnection } = await this.sfuServerService.makePeerConnection(client.id);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) client.emit('sendIceCandidate', event.candidate);
    };

    peerConnection.ontrack = async (event) => {
      // mediaStreams && peerConnections?? 정보가 필요함 (service에 있음)
      await this.sfuServerService.saveMediaStream(client.id, event.streams[0]);
      if (this.sfuServerService.hasMultiplePeerConnections()) {
        const offerList: { socketId: string; offer: RTCSessionDescriptionInit }[] =
          await this.sfuServerService.addTracks();
        offerList.forEach(({ socketId, offer }) => this.server.to(socketId).emit('offer', offer));
      }
    };

    const { answer } = await this.sfuServerService.makeAnswer(peerConnection, offer);
    client.emit('answer', answer);
  }

  @SubscribeMessage('answer')
  async answer(
    @ConnectedSocket() client: Socket,
    @MessageBody() answer: RTCSessionDescriptionInit,
  ) {
    await this.sfuServerService.answerReceived(client.id, answer);
  }

  @SubscribeMessage('sendIceCandidate')
  handleSendIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() iceCandidate: RTCIceCandidateInit,
  ) {
    const socketId = client.id;
    this.sfuServerService.setIceCandidate(socketId, iceCandidate);
  }
}
