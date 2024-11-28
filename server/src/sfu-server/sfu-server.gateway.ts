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
//
// 아 이거 dev 브랜치에서 .... 커밋은 아직 안 했어요. 아 됩니다!! 저 근데 잠시만요
//
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
    this.server.to(socketIdList).emit('removeStream', { mediaStreamId });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() joinRoomDto: JoinRoomDto) {
    const { roomId } = joinRoomDto;
    const socketId = client.id;
    const { users } = await this.sfuServerService.enterRoom(socketId, roomId);

    this.logger.info(`${socketId} 접속, ${JSON.stringify(users)}`);
  }
}
