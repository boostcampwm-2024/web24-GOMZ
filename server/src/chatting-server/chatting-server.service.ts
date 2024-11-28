import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StudyRoomsService } from '../study-room/study-room.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ROOM_ID_NOT_FOUND_ERROR, ROOM_NOT_FOUND } from './chatting-server.constant';

@Injectable()
export class ChattingService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
  ) {}

  async getRoomMemberSocketIdList(clientId: string): Promise<string[]> {
    const roomId = await this.studyRoomsService.findUserRoom(clientId);
    await this.validateRoomIdExists(roomId, clientId);

    const users = await this.studyRoomsService.getRoomUsers(roomId);
    const userList = users.map((user) => user.socketId);

    return userList;
  }

  private async validateRoomIdExists(roomId: string, clientId: string) {
    if (!roomId) {
      this.logger.info(ROOM_NOT_FOUND(clientId));
      throw new NotFoundException(ROOM_ID_NOT_FOUND_ERROR);
    }
  }
}
