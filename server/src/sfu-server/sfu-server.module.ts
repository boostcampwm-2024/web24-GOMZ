import { Module } from '@nestjs/common';
import { SfuServerGateway } from './sfu-server.gateway';

@Module({
  providers: [SfuServerGateway],
})
export class SfuServerModule {}
