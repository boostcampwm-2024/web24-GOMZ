import { Module } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { StudyRoomsService } from 'src/study-room/study-room.service';

@Module({
  imports: [],
  providers: [ChattingService, StudyRoomsService],
})
export class ChattingModule {}
