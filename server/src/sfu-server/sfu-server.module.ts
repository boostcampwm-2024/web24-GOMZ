import { Module } from '@nestjs/common';
import { SfuServerGateway } from './sfu-server.gateway';
import { SfuServerService } from './sfu-server.service';
import { ChattingService } from 'src/chatting/chatting.service';
import { StudyRoomModule } from 'src/study-room/study-room.module';

@Module({
  imports: [StudyRoomModule],
  providers: [SfuServerGateway, SfuServerService, ChattingService],
})
export class SfuServerModule {}
