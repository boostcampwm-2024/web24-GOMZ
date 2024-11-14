import { StudyRoomsService } from './study-room.service';
import { MockStudyRoomRepository } from './mock.repository';

describe('StudyRoomsService', () => {
  let service: StudyRoomsService;
  let mockRepository: MockStudyRoomRepository;

  beforeEach(() => {
    mockRepository = new MockStudyRoomRepository();
    service = new StudyRoomsService(mockRepository);
  });

  describe('사용자가 방을 생성했을 때', () => {
    it('사용자가 방을 생성한다', () => {
      service.createRoom('room1', 'user1');
      service.createRoom('room2', 'user2');
      const allRoom = service.getAllRoom();
      const expectedResult = {
        room1: ['user1'],
        room2: ['user2'],
      };
      expect(allRoom).toEqual(expectedResult);
    });
  });

  describe('사용자가 방에 접속했을 때', () => {
    it('사용자가 방에 추가된다', () => {
      service.addUserToRoom('room1', 'user1');
      const users = service.getRoomUsers('room1');
      expect(users).toContain('user1');
    });
  });

  describe('사용자가 방에서 나갔을 때', () => {
    it('사용자가 방에서 제거된다', () => {
      service.addUserToRoom('room1', 'user1');
      service.removeUserFromRoom('room1', 'user1');
      const users = service.getRoomUsers('room1');
      expect(users).not.toContain('user1');
    });
  });

  describe('존재하지 않는 방에 접근했을 때', () => {
    it('빈 배열이 반환된다', () => {
      const users = service.getRoomUsers('nonExistentRoom');
      expect(users).toEqual([]);
    });
  });

  describe('사용자가 모든 방에서 나갔을 때', () => {
    it('모든 방에서 해당 사용자가 제거된다', () => {
      service.addUserToRoom('room1', 'user1');
      service.addUserToRoom('room2', 'user1');
      service.leaveAllRooms('user1');
      expect(service.getRoomUsers('room1')).not.toContain('user1');
      expect(service.getRoomUsers('room2')).not.toContain('user1');
    });
  });
});
