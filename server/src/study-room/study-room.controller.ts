import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { StudyRoomsService } from './study-room.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  CheckAccessRequestDto,
  CreateRoomRequestDto,
  CreateRoomResponseDto,
} from './dto/create-room.dto';
import { RoomInfoResponseDto } from './dto/read-room.dto';

@Controller('study-room')
export class StudyRoomController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomService: StudyRoomsService,
  ) {}

  @Post('/create')
  creatRoom(@Body() createRoomRequestDto: CreateRoomRequestDto): Promise<CreateRoomResponseDto> {
    return this.studyRoomService.createRoom(createRoomRequestDto);
  }

  @Get('/rooms')
  async getAllRooms(): Promise<RoomInfoResponseDto[]> {
    return await this.studyRoomService.getAllRoom();
  }

  @Get('/check')
  async checkAccess(@Query() checkAccessRequestDto: CheckAccessRequestDto) {
    try {
      const result = await this.studyRoomService.checkAccess(checkAccessRequestDto);
      return { canAccess: result };
    } catch (error) {
      return { canAccess: false, error };
    }
  }
}
