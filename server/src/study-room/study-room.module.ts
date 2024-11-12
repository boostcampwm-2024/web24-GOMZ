import { Module } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';

@Module({
    providers: [StudyRoomsService],
    exports: [StudyRoomsService],
})
export class StudyRoomModule { }
