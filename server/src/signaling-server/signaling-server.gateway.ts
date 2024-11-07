import { SubscribeMessage, WebSocketGateway, MessageBody, OnGatewayConnection, WebSocketServer, ConnectedSocket, OnGatewayDisconnect} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SignalingServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // 방에 들어있는 사용자의 소켓 정보
  users = [];

  @WebSocketServer()
  server: Server;

  // 1. 신규 참가자가 접속을 요청한다. 그리고 방에 있는 
  // 기존참가자들 소켓 정보를 반환한다.
  handleConnection(client: Socket) {
    console.log(client.id, '접속!!!');
    client.emit('offerRequest', JSON.stringify({ users: this.users }));
    this.users.push(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(client.id, '접속해제!!!');
    this.users = this.users.filter((user) => user !== client.id);
  }

  // 2. 신규 참가자가 기존 참가자들에게 offer를 보낸다.
  @SubscribeMessage('sendOffer')
  handleSendOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody('offer') offer: RTCSessionDescriptionInit,
    @MessageBody('oldId') oldId: string,
  ) {
    this.server.to(oldId).emit('answerRequest', JSON.stringify({ newId: client.id, offer }));
  }

  // 3. 기존 참가자들은 신규 참가자에게 answer를 보낸다.
  @SubscribeMessage('sendAnswer')
  handleSendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody('answer') answer: RTCSessionDescriptionInit,
    @MessageBody('newId') newId: string
  ) {
    this.server.to(newId).emit('completeConnection', JSON.stringify({ oldId: client.id, answer }));
  }

  @SubscribeMessage('sendIcecandidate')
  handleSendIcecandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody('targetId') targetId: string,
    @MessageBody('iceCandidate') candidate: RTCIceCandidateInit,
  ) {
    this.server.to(targetId).emit('setIcecandidate', JSON.stringify({ senderId: client.id, iceCandidate: candidate }));
  }
}
