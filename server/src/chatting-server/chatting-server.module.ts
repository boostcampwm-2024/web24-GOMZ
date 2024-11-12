import { Module } from '@nestjs/common';
import { ChattingServerGateway } from './chatting-server.gateway';

@Module({
  providers: [ChattingServerGateway],
})
export class ChattingServerModule { }
