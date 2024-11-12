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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChattingServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 각 방에 있는 사용자들의 소켓 정보
  rooms: { [key: string]: string[] } = {};

  // 사용자가 접속했을 때
  handleConnection(client: Socket) {
    console.log(`${client.id} 접속!`);
  }

  // 사용자가 접속을 해제했을 때
  handleDisconnect(client: Socket) {
    console.log(`${client.id} 접속 해제!`);
    this.leaveAllRooms(client);
  }

  // 특정 방에 참가 요청을 받음
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
  ) {
    client.join(room);
    if (!this.rooms[room]) {
      this.rooms[room] = [];
    }
    this.rooms[room].push(client.id);
    console.log(`${client.id}님이 방 ${room}에 입장했습니다.`);

    // 방에 있는 다른 사용자들에게 알림
    this.server.to(room).emit('userJoined', JSON.stringify({ userId: client.id }));
  }

  // 특정 방에서 퇴장 요청을 받음
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
  ) {
    client.leave(room);
    this.rooms[room] = this.rooms[room]?.filter((userId) => userId !== client.id);
    console.log(`${client.id}님이 방 ${room}에서 나갔습니다.`);

    // 방에 있는 다른 사용자들에게 알림
    this.server.to(room).emit('userLeft', JSON.stringify({ userId: client.id }));
  }

  // 특정 방에 메시지 전송
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
    @MessageBody('message') message: string,
  ) {
    console.log(`방 ${room}에서 ${client.id}가 메시지를 보냄: ${message}`);
    this.server.to(room).emit('receiveMessage', JSON.stringify({ userId: client.id, message }));
  }

  // 사용자가 모든 방에서 나가기
  private leaveAllRooms(client: Socket) {
    Object.keys(this.rooms).forEach((room) => {
      this.rooms[room] = this.rooms[room]?.filter((userId) => userId !== client.id);
      this.server.to(room).emit('userLeft', JSON.stringify({ userId: client.id }));
    });
  }
}
