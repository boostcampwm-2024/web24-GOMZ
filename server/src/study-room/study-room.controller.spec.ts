import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomController } from './study-room.controller';
import { StudyRoomsService } from './study-room.service';
import { MockStudyRoomRepository } from './mock.repository';
import { StudyRoom } from './study-room.entity';

describe('StudyRoomController', () => {
  let controller: StudyRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyRoomController],
      providers: [StudyRoomsService, MockStudyRoomRepository],
    }).compile();

    controller = module.get<StudyRoomController>(StudyRoomController);
  });

  describe('방 생성 api + 전체 방 리스트 api 테스트', () => {
    it('방 생성', () => {
      const roomId = 'room1';
      const clientId = 'client1';
      const newRoom = new StudyRoom(roomId, clientId);

      const studyRoom = controller.creatRoom(roomId, clientId);

      expect(studyRoom).toEqual(newRoom);
    });

    it('전체 방 리스트', () => {
      const roomId1 = 'room1';
      const clientId1 = 'client1';

      const roomId2 = 'room2';
      const clientId2 = 'client2';

      controller.creatRoom(roomId1, clientId1);
      controller.creatRoom(roomId2, clientId2);

      const allRooms = controller.getAllRooms();

      expect(Object.keys(allRooms).length).toBe(2);
    });
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
