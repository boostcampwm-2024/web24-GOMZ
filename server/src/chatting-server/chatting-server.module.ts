import { Module } from '@nestjs/common';
import { ChattingServerGateway } from './chatting-server.gateway';
import { StudyRoomModule } from '../study-room/study-room.module';
import { ChattingServerService } from './chatting-server.service';

@Module({
  imports: [StudyRoomModule],
  providers: [ChattingServerGateway, ChattingServerService],
})
export class ChattingServerModule {}
