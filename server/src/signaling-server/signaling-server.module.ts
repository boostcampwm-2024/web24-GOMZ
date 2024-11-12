import { Module } from '@nestjs/common';
import { SignalingServerGateway } from './signaling-server.gateway';
import { StudyRoomModule } from 'src/study-room/study-room.module';

@Module({
  imports: [StudyRoomModule],
  providers: [SignalingServerGateway],
})
export class SignalingServerModule { }
