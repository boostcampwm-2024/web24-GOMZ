import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomRepository } from './study-room.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoom } from '../entity/study-room.entity';

describe('Study Room 레포지토리 테스트', () => {
  let studyRoomRepository: StudyRoomRepository;
  let repository: Repository<StudyRoom>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyRoomRepository, // 1. 대조군
        {
          // 2. 비교군
          provide: getRepositoryToken(StudyRoom),
          useClass: Repository,
        },
      ],
    }).compile();

    studyRoomRepository = module.get<StudyRoomRepository>(StudyRoomRepository);
    repository = module.get<Repository<StudyRoom>>(getRepositoryToken(StudyRoom));
  });

  describe('사용자가 방을 생성할 때', () => {
    it('방이 성공적으로 생성된다.', async () => {
      const roomName = 'Math Study Room';
      const categoryId = 1;

      const mockStudyRoom: StudyRoom = {
        room_id: 1,
        room_name: roomName,
        category_id: categoryId,
        created_at: new Date(),
        setCreatedAt: function (): void {
          throw new Error('Function not implemented.');
        },
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockStudyRoom);
      jest.spyOn(repository, 'save').mockResolvedValue(mockStudyRoom);

      const result = await studyRoomRepository.createRoom(roomName, categoryId);

      expect(repository.create).toHaveBeenCalledWith({
        room_name: roomName,
        category_id: categoryId,
      });
      expect(repository.save).toHaveBeenCalledWith(mockStudyRoom);
      expect(result).toEqual(mockStudyRoom);
    });
  });

  describe('방 ID로 방을 찾을 때', () => {
    it('방이 존재하면 방을 반환한다.', async () => {
      const roomId = 1;

      const mockStudyRoom: StudyRoom = {
        room_id: roomId,
        room_name: 'Math Study Room',
        category_id: 1,
        created_at: new Date(),
        setCreatedAt: function (): void {
          throw new Error('Function not implemented.');
        },
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockStudyRoom);

      const result = await studyRoomRepository.findRoom(roomId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { room_id: roomId } });
      expect(result).toEqual(mockStudyRoom);
    });

    it('방이 존재하지 않으면 undefined를 반환한다.', async () => {
      const roomId = 999;

      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      const result = await studyRoomRepository.findRoom(roomId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { room_id: roomId } });
      expect(result).toBeUndefined();
    });
  });
});
