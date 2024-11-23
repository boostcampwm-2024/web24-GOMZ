import { Inject, Injectable } from '@nestjs/common';
import { StudyRoomsService } from '../study-room/study-room.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class ChattingServerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly studyRoomsService: StudyRoomsService,
  ) {}

  async handleSendMessage(clientId: string): Promise<string[]> {
    const roomId = await this.studyRoomsService.findUserRoom(clientId);
    await this.validateRoomIdExists(roomId, clientId);

    const users = await this.studyRoomsService.getRoomUsers(roomId);
    const userList = users.map((user) => user.socketId);

    return userList;
  }

  private async validateRoomIdExists(roomId: string, clientId: string) {
    if (!roomId) {
      this.logger.info(`사용자 ${clientId}가 속한 방이 없습니다.`);
      throw new Error('Room ID does not exist for the user.');
    }
  }
}
