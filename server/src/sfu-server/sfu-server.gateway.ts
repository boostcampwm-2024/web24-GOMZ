import { OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SfuServerGateway implements OnGatewayDisconnect {
  constructor() {}

  @WebSocketServer()
  server: Server;

  handleDisconnect() {}
}
