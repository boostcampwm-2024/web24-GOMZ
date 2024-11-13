import { Module } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { MockStudyRoomRepository } from './mock.repository';

@Module({
  providers: [StudyRoomsService, MockStudyRoomRepository],
  exports: [StudyRoomsService],
})
export class StudyRoomModule {}
