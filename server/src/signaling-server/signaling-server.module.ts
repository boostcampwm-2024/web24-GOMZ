import { Module } from '@nestjs/common';
import { SignalingServerGateway } from './signaling-server.gateway';

@Module({
  providers: [SignalingServerGateway],
})
export class SignalingServerModule { }
