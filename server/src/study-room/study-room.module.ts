import { Module } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { MockStudyRoomRepository } from './mock.repository';
import { StudyRoomController } from './study-room.controller';

@Module({
  providers: [StudyRoomsService, MockStudyRoomRepository],
  exports: [StudyRoomsService],
  controllers: [StudyRoomController],
})
export class StudyRoomModule {}
