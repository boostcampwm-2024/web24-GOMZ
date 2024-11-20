import { Body, Controller, Get, Post } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './entity/study-room.entity';

@Controller('study-room')
export class StudyRoomController {
  constructor(private readonly studyRoomService: StudyRoomsService) {}

  @Post('/create')
  async creatRoom(
    @Body('roomId') roomId: string,
    @Body('clientId') clientId: string,
  ): Promise<StudyRoom> {
    return await this.studyRoomService.createRoom(roomId, clientId);
  }

  @Get('/rooms')
  async getAllRooms(): Promise<{ roomId: string; users: { socketId: string }[] }[]> {
    return await this.studyRoomService.getAllRoom();
  }
}
