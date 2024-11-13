import { Module } from '@nestjs/common';
import { SignalingServerGateway } from './signaling-server.gateway';
import { StudyRoomModule } from '../study-room/study-room.module';

@Module({
  imports: [StudyRoomModule],
  providers: [SignalingServerGateway],
})
export class SignalingServerModule {}
