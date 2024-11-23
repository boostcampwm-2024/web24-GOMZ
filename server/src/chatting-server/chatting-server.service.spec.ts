import { Test, TestingModule } from '@nestjs/testing';
import { ChattingServerService } from './chatting-server.service';
import { StudyRoomsService } from '../study-room/study-room.service';
import { NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Chatting Server 서비스 테스트', () => {
  let service: ChattingServerService;

  const mockStudyRoomsService = {
    findUserRoom: jest.fn(),
    getRoomUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingServerService,
        { provide: StudyRoomsService, useValue: mockStudyRoomsService },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ChattingServerService>(ChattingServerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoomMemberSocketIdList를 요청하면', () => {
    it('존재하는 방과 사용자 목록이 있을 경우 소켓 ID 리스트를 반환한다.', async () => {
      // given
      const mockClientId = 'client123';
      const mockRoomId = 'room456';
      const mockUsers = [{ socketId: 'socket1' }, { socketId: 'socket2' }];
      mockStudyRoomsService.findUserRoom.mockResolvedValue(mockRoomId);
      mockStudyRoomsService.getRoomUsers.mockResolvedValue(mockUsers);

      // when
      const result = await service.getRoomMemberSocketIdList(mockClientId);

      // then
      expect(result).toEqual(['socket1', 'socket2']);
      expect(mockStudyRoomsService.findUserRoom).toHaveBeenCalledWith(mockClientId);
      expect(mockStudyRoomsService.getRoomUsers).toHaveBeenCalledWith(mockRoomId);
    });

    it('존재하지 않는 방 ID일 경우 NotFoundException을 던진다.', async () => {
      // given
      const mockClientId = 'client123';
      mockStudyRoomsService.findUserRoom.mockResolvedValue(null);

      // when, then
      await expect(service.getRoomMemberSocketIdList(mockClientId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockStudyRoomsService.findUserRoom).toHaveBeenCalledWith(mockClientId);
      expect(mockStudyRoomsService.getRoomUsers).not.toHaveBeenCalled();
    });
  });

  describe('validateRoomIdExists를 요청하면', () => {
    it('방 ID가 false 값이면 NotFoundException을 던진다.', async () => {
      // given
      const mockClientId = 'client123';

      // when, then
      await expect(service['validateRoomIdExists'](null, mockClientId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('방 ID가 존재하면 예외를 던지지 않는다.', async () => {
      // given
      const mockClientId = 'client123';
      const mockRoomId = 'room456';

      // when, then
      await expect(
        service['validateRoomIdExists'](mockRoomId, mockClientId),
      ).resolves.not.toThrow();
    });
  });
});
