import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './study-room.entity';

@Controller('study-room')
export class StudyRoomController {
  constructor(
    private readonly studyRoomService: StudyRoomsService,
  ) {
  }

  /**
   * @param roomId 방 ID
   * @returns 생성된 방
   */
  @Post('/create')
  creatRoom(@Body('roomId') roomId: string) {
    this.studyRoomService.createRoom(roomId);
  }

  @Get('/rooms')
  getAllRooms(): Record<string, StudyRoom> {
    return this.studyRoomService.getAllRoom();
  }

}
