import { Body, Controller, Get, Inject, ParseIntPipe, Post, Query } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './entity/study-room.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('study-room')
export class StudyRoomController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomService: StudyRoomsService,
  ) {}

  @Post('/create')
  async creatRoom(
    @Body('roomName') roomName: string,
    @Body('clientId') clientId: string,
  ): Promise<StudyRoom> {
    return await this.studyRoomService.createRoom(roomName, clientId);
  }

  @Get('/rooms')
  async getAllRooms(): Promise<{ roomId: string; users: { socketId: string }[] }[]> {
    return await this.studyRoomService.getAllRoom();
  }

  @Get('/check')
  async checkAccess(
    @Query('password') password: string,
    @Query('roomId', ParseIntPipe) roomId: number,
  ) {
    try {
      const result = await this.studyRoomService.checkAccess(password, roomId);
      return { canAccess: result };
    } catch (error) {
      return { canAccess: false, error };
    }
  }
}
