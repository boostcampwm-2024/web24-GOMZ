import { MockStudyRoomRepository } from './mock.repository';

describe('Study Room 레포지토리 테스트', () => {
  let repository: MockStudyRoomRepository;

  beforeEach(() => {
    repository = new MockStudyRoomRepository();
  });

  describe('사용자가 특정 방에 연결되었을 때', () => {
    it('사용자가 방에 추가된다', () => {
      repository.addUserToRoom('room1', 'user1');
      const users = repository.getRoomUsers('room1');
      expect(users).toContain('user1');
    });
  });

  describe('사용자가 방에서 나갔을 때', () => {
    it('사용자가 방에서 제거된다', () => {
      repository.addUserToRoom('room1', 'user1');
      repository.removeUserFromRoom('room1', 'user1');
      const users = repository.getRoomUsers('room1');
      expect(users).not.toContain('user1');
    });
  });

  describe('존재하지 않는 방에 접근했을 때', () => {
    it('빈 배열이 반환된다', () => {
      const users = repository.getRoomUsers('nonExistentRoom');
      expect(users).toEqual([]);
    });
  });

  describe('사용자가 모든 방에서 나갔을 때', () => {
    it('모든 방에서 해당 사용자가 제거된다', () => {
      repository.addUserToRoom('room1', 'user1');
      repository.addUserToRoom('room2', 'user1');
      repository.leaveAllRooms('user1');
      expect(repository.getRoomUsers('room1')).not.toContain('user1');
      expect(repository.getRoomUsers('room2')).not.toContain('user1');
    });
  });
});
