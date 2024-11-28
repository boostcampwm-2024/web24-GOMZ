import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ChattingService } from './chatting-server.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChattingGateway {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly chattingServerService: ChattingService,
  ) {}

  @WebSocketServer()
  server: Server;
}
