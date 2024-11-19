import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyRoomsService } from './study-room.service';
import { StudyRoomController } from './study-room.controller';
import { StudyRoom } from './study-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyRoom])],
  controllers: [StudyRoomController],
  providers: [StudyRoomsService],
  exports: [StudyRoomsService],
})
export class StudyRoomModule {}
