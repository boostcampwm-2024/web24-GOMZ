import { Module } from '@nestjs/common';
import { ChattingServerGateway } from './chatting-server.gateway';
import { StudyRoomModule } from 'src/study-room/study-room.module';

@Module({
  imports: [StudyRoomModule],
  providers: [ChattingServerGateway],
})
export class ChattingServerModule {}
