import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomParticipantRepository } from './study-room-participant.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoomParticipant } from '../entity/study-room-participant.entity';

describe('Study Room Participant 레포지토리 테스트', () => {
  let studyRoomParticipantRepository: StudyRoomParticipantRepository;
  let repository: Repository<StudyRoomParticipant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyRoomParticipantRepository,
        {
          provide: getRepositoryToken(StudyRoomParticipant),
          useClass: Repository,
        },
      ],
    }).compile();

    studyRoomParticipantRepository = module.get<StudyRoomParticipantRepository>(
      StudyRoomParticipantRepository,
    );
    repository = module.get<Repository<StudyRoomParticipant>>(
      getRepositoryToken(StudyRoomParticipant),
    );
  });

  describe('사용자가 방에 추가될 때', () => {
    it('사용자가 성공적으로 추가된다.', async () => {
      const roomId = 1;
      const socketId = '12345';
      const nickname = 'Tester';

      const mockParticipant: StudyRoomParticipant = {
        socket_id: socketId,
        nickname,
        room_id: roomId,
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockParticipant);
      jest.spyOn(repository, 'save').mockResolvedValue(mockParticipant);

      await studyRoomParticipantRepository.addUserToRoom(roomId, socketId, nickname);

      expect(repository.create).toHaveBeenCalledWith({
        socket_id: socketId,
        nickname,
        room_id: roomId,
      });
      expect(repository.save).toHaveBeenCalledWith(mockParticipant);
    });
  });

  describe('특정 사용자를 조회할 때', () => {
    it('사용자가 존재하면 반환한다.', async () => {
      const socketId = '12345';

      const mockParticipant: StudyRoomParticipant = {
        socket_id: socketId,
        nickname: 'Tester',
        room_id: 1,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockParticipant);

      const result = await studyRoomParticipantRepository.findParticipant(socketId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { socket_id: socketId } });
      expect(result).toEqual(mockParticipant);
    });

    it('사용자가 존재하지 않으면 undefined를 반환한다.', async () => {
      const socketId = '99999';

      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      const result = await studyRoomParticipantRepository.findParticipant(socketId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { socket_id: socketId } });
      expect(result).toBeUndefined();
    });
  });

  describe('사용자가 방에서 제거될 때', () => {
    it('사용자가 존재하면 성공적으로 제거된다.', async () => {
      const roomId = 1;
      const socketId = '12345';

      const mockParticipant: StudyRoomParticipant = {
        socket_id: socketId,
        nickname: 'Tester',
        room_id: roomId,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockParticipant);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockParticipant);

      await studyRoomParticipantRepository.removeUserFromRoom(roomId, socketId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { socket_id: socketId, room_id: roomId },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockParticipant);
    });

    it('사용자가 존재하지 않으면 예외를 발생시킨다.', async () => {
      const roomId = 1;
      const socketId = '99999';

      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(
        studyRoomParticipantRepository.removeUserFromRoom(roomId, socketId),
      ).rejects.toThrow('Participant not found in the room');
    });
  });

  describe('특정 방의 모든 사용자를 조회할 때', () => {
    it('방의 모든 사용자 정보를 반환한다.', async () => {
      const roomId = 1;

      const mockParticipants: StudyRoomParticipant[] = [
        { socket_id: '12345', nickname: 'Tester1', room_id: roomId },
        { socket_id: '67890', nickname: 'Tester2', room_id: roomId },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockParticipants);

      const result = await studyRoomParticipantRepository.getRoomUsers(roomId);

      expect(repository.find).toHaveBeenCalledWith({ where: { room_id: roomId } });
      expect(result).toEqual([
        { socketId: '12345', nickname: 'Tester1' },
        { socketId: '67890', nickname: 'Tester2' },
      ]);
    });
  });
});
