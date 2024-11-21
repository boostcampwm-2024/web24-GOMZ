import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomController } from './study-room.controller';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './entity/study-room.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('Study Room 컨트롤러 테스트', () => {
  let controller: StudyRoomController;
  let service: StudyRoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyRoomController],
      providers: [
        {
          provide: StudyRoomsService,
          useValue: {
            createRoom: jest.fn(),
            getAllRoom: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudyRoomController>(StudyRoomController);
    service = module.get<StudyRoomsService>(StudyRoomsService);
  });

  describe('POST /create 요청', () => {
    it('방을 생성하고 결과를 반환해야 한다.', async () => {
      const roomName = 'testRoom';
      const password = null;
      const categoryName = '#test';

      const mockStudyRoom: StudyRoom = {
        room_id: 1,
        room_name: 'testRoom',
        category_name: '#test',
        created_at: new Date(),
        setCreatedAt: jest.fn(),
        password: null,
      };

      jest.spyOn(service, 'createRoom').mockResolvedValue({ roomId: 1 });

      const result = await service.createRoom(roomName, password, categoryName);

      expect(service.createRoom).toHaveBeenCalledWith(roomName, password, categoryName);
      expect(result.roomId).toEqual(mockStudyRoom.room_id);
    });
  });

  describe('GET /rooms 요청', () => {
    it('모든 방 목록을 반환해야 한다.', async () => {
      const mockRooms = [
        {
          roomId: 19,
          roomName: 'random1',
          categoryName: '#DB',
          isPrivate: false,
          curParticipant: 1,
          maxParticipant: 8,
        },
        {
          roomId: 20,
          roomName: 'random2',
          categoryName: '#OS',
          isPrivate: false,
          curParticipant: 1,
          maxParticipant: 8,
        },
      ];

      jest.spyOn(service, 'getAllRoom').mockResolvedValue(mockRooms);

      const result = await controller.getAllRooms();
      expect(service.getAllRoom).toHaveBeenCalled();
      expect(result).toEqual(mockRooms);
    });
  });
});
