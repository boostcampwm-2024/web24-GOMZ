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
import { createHmac } from 'crypto';

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
      return { canAccess: false, error: error.response };
    }
  }

  @Get('/credentials')
  getCoturnCredentials() {
    const validSeconds = 1 * 60 * 60; // 1시간
    const username = (Math.floor(Date.now() / 1000) + validSeconds).toString();
    const hmac = createHmac('sha1', process.env.COTURN_SECRET);
    hmac.setEncoding('base64');
    hmac.write(username);
    hmac.end();
    const password = hmac.read();

    const stunUrls = ['stun:stun.l.google.com:19302'];
    return {
      iceServers: [
        { urls: stunUrls },
        {
          urls: process.env.COTURN_TURN_URL,
          username: username,
          credential: password,
        },
      ],
    };
  }
}
