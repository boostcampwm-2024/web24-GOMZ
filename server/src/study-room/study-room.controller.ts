import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './study-room.entity';

@Controller('study-room')
export class StudyRoomController {
  constructor(
    private readonly studyRoomService: StudyRoomsService,
  ) {
  }

  @Post('/create')
  creatRoom(
    @Body('roomId') roomId: string,
    @Body('clientId') clientId: string): StudyRoom {
    return this.studyRoomService.createRoom(roomId, clientId);
  }

  @Get('/rooms')
  getAllRooms(): Record<string, StudyRoom> {
    return this.studyRoomService.getAllRoom();
  }

}
