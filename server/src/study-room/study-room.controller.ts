import { Body, Controller, Get, Inject, ParseIntPipe, Post, Query } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
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
  creatRoom(
    @Body('roomName') roomName: string,
    @Body('password') password: string,
    @Body('categoryName') categoryName: string,
  ): Promise<{ roomId: number }> {
    return this.studyRoomService.createRoom(roomName, password, categoryName);
  }

  @Get('/rooms')
  async getAllRooms(): Promise<
    {
      roomId: string;
      roomName: string;
      categoryName: string;
      isPrivate: boolean;
      curParticipant: number;
      maxParticipant: number;
    }[]
  > {
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
