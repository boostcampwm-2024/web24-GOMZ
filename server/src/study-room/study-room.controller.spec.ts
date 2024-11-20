import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomController } from './study-room.controller';
import { StudyRoomsService } from './study-room.service';
import { StudyRoom } from './entity/study-room.entity';

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
      ],
    }).compile();

    controller = module.get<StudyRoomController>(StudyRoomController);
    service = module.get<StudyRoomsService>(StudyRoomsService);
  });

  describe('클라이언트가 방 생성을 요청할 때', () => {
    it('새로운 방을 생성한다.', async () => {
      const roomId = '1';
      const clientId = 'socket123';

      const mockStudyRoom: StudyRoom = {
        room_id: 1,
        room_name: 'Test Room',
        category_id: 0,
        created_at: new Date(),
        setCreatedAt: jest.fn(),
      };

      jest.spyOn(service, 'createRoom').mockResolvedValue(mockStudyRoom);

      const result = await controller.creatRoom(roomId, clientId);

      expect(service.createRoom).toHaveBeenCalledWith(roomId, clientId);
      expect(result).toEqual(mockStudyRoom);
    });
  });

  describe('클라이언트가 방 조회를 요청할 때', () => {
    it('모든 방을 조회한다.', async () => {
      const mockRooms = [
        {
          roomId: '1',
          users: [{ socketId: 'socket123' }, { socketId: 'socket456' }],
        },
        {
          roomId: '2',
          users: [{ socketId: 'socket789' }],
        },
      ];

      jest.spyOn(service, 'getAllRoom').mockResolvedValue(mockRooms);

      const result = await controller.getAllRooms();

      expect(service.getAllRoom).toHaveBeenCalled();
      expect(result).toEqual(mockRooms);
    });
  });
});
