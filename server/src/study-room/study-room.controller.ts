import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './study-room.entity';

@Controller('study-room')
export class StudyRoomController {
  constructor(private readonly studyRoomService: StudyRoomsService) {}

  // 지금은 로그인 기능 구현 전이라서 nickname도 같이 넘겨줘야 돼요.
  @Post('/create')
  creatRoom(
    @Body('roomId') roomId: string,
    @Body('clientId') clientId: string,
    @Body('nickname') nickname: string,
  ): StudyRoom {
    return this.studyRoomService.createRoom(roomId, clientId, nickname);
  }

  // 비동기 걸어야함
  @Get('/rooms')
  getAllRooms(): { roomId: string; users: string[] }[] {
    return this.studyRoomService.getAllRoom();
  }
}
