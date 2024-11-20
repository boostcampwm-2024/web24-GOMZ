import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomController } from './study-room.controller';
import { StudyRoomsService } from './study-room.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

describe('Study Room 컨트롤러  테스트', () => {
  let controller: StudyRoomController;
  let service: StudyRoomsService;

  beforeEach(async () => {
    const mockLogger = { info: jest.fn(), error: jest.fn() } as unknown as Logger;

    const mockService = {
      createRoom: jest.fn(),
      getAllRoom: jest.fn(),
      checkAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyRoomController],
      providers: [
        {
          provide: StudyRoomsService,
          useValue: mockService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<StudyRoomController>(StudyRoomController);
    service = module.get<StudyRoomsService>(StudyRoomsService);
  });

  describe('POST /create 요청', () => {
    it('방을 생성하고 결과를 반환해야 한다.', async () => {
      const mockRoom = {
        room_id: 1,
        room_name: 'Test Room',
        category_id: 0,
        created_at: new Date(),
        setCreatedAt: jest.fn(),
        password: '',
      };
      jest.spyOn(service, 'createRoom').mockResolvedValue(mockRoom);

      const roomName = 'Test Room';
      const clientId = 'socket123';
      const result = await controller.creatRoom(roomName, clientId);

      expect(service.createRoom).toHaveBeenCalledWith(roomName, clientId);
      expect(result).toEqual(mockRoom);
    });
  });

  describe('GET /rooms 요청', () => {
    it('모든 방 목록을 반환해야 한다.', async () => {
      const mockRooms = [
        {
          roomId: '1',
          roomName: 'Room 1',
          users: [{ socketId: 'user1' }],
        },
        {
          roomId: '2',
          roomName: 'Room 2',
          users: [{ socketId: 'user2' }],
        },
      ];
      jest.spyOn(service, 'getAllRoom').mockResolvedValue(mockRooms);

      const result = await controller.getAllRooms();

      expect(service.getAllRoom).toHaveBeenCalled();
      expect(result).toEqual(mockRooms);
    });
  });

  describe('GET /check 요청', () => {
    it('올바른 비밀번호로 접근 시 canAccess: true를 반환해야 한다.', async () => {
      const password = 'correct_password';
      const roomId = 1;

      jest.spyOn(service, 'checkAccess').mockResolvedValue(true);

      const result = await controller.checkAccess(password, roomId);

      expect(service.checkAccess).toHaveBeenCalledWith(password, roomId);
      expect(result).toEqual({ canAccess: true });
    });

    it('잘못된 비밀번호로 접근 시 canAccess: false와 에러를 반환해야 한다.', async () => {
      const password = 'wrong_password';
      const roomId = 1;

      jest.spyOn(service, 'checkAccess').mockRejectedValue(new Error('Unauthorized'));

      const result = await controller.checkAccess(password, roomId);

      expect(service.checkAccess).toHaveBeenCalledWith(password, roomId);
      expect(result).toEqual({
        canAccess: false,
        error: expect.any(Error),
      });
    });
  });
});
