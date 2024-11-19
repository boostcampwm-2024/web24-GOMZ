import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './study-room.entity';

@Controller('study-room')
export class StudyRoomController {
  constructor(private readonly studyRoomService: StudyRoomsService) {}

  // 지금은 로그인 기능 구현 전이라서 nickname도 같이 넘겨줘야 돼요.
  @Post('/create')
  async creatRoom(
    @Body('roomId') roomId: string,
    @Body('clientId') clientId: string,
    @Body('nickname') nickname: string,
  ): Promise<StudyRoom> {
    return await this.studyRoomService.createRoom(roomId, clientId, nickname);
  }

  @Get('/rooms')
  async getAllRooms(): Promise<
    { roomId: string; users: { socketId: string; nickname: string }[] }[]
  > {
    return await this.studyRoomService.getAllRoom();
  }
}
