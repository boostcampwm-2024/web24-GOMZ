import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomParticipantRepository } from './study-room-participant.repository';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoomParticipant } from '../entity/study-room-participant.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('Study Room Participant 레포지토리 테스트', () => {
  let studyRoomParticipantRepository: StudyRoomParticipantRepository;
  let repository: Repository<StudyRoomParticipant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // 테스트를 위한 MySQL 데이터베이스 설정
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DATABASE_TEST_HOST,
          port: Number(process.env.DATABASE_TEST_PORT),
          username: process.env.DATABASE_TEST_USER,
          password: process.env.DATABASE_TEST_PASSWORD,
          database: process.env.DATABASE_TEST_NAME,
          entities: [StudyRoomParticipant],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([StudyRoomParticipant]),
      ],
      providers: [StudyRoomParticipantRepository],
    }).compile();

    studyRoomParticipantRepository = module.get<StudyRoomParticipantRepository>(
      StudyRoomParticipantRepository,
    );
    repository = module.get<Repository<StudyRoomParticipant>>(
      getRepositoryToken(StudyRoomParticipant),
    );
  });

  afterEach(async () => {
    await repository.query('DROP TABLE study_room_participant;');
    await repository.manager.connection.destroy();
  });

  describe('사용자가 방에 추가될 때', () => {
    it('사용자가 성공적으로 추가된다.', async () => {
      const roomId = 1;
      const socketId = '12345';

      await studyRoomParticipantRepository.addUserToRoom(roomId, socketId);

      const savedParticipant = await repository.findOne({
        where: { socket_id: socketId, room_id: roomId },
      });

      expect(savedParticipant).toBeDefined();
      expect(savedParticipant?.socket_id).toEqual(socketId);
      expect(savedParticipant?.room_id).toEqual(roomId);
    });
  });

  describe('특정 사용자를 조회할 때', () => {
    it('사용자가 존재하면 반환한다.', async () => {
      const roomId = 1;
      const socketId = '12345';

      await studyRoomParticipantRepository.addUserToRoom(roomId, socketId);

      const result = await studyRoomParticipantRepository.findParticipant(socketId);

      expect(result).toBeDefined();
      expect(result?.socket_id).toEqual(socketId);
      expect(result?.room_id).toEqual(roomId);
    });

    it('사용자가 존재하지 않으면 null을 반환한다.', async () => {
      const socketId = '99999';

      const result = await studyRoomParticipantRepository.findParticipant(socketId);

      expect(result).toBeNull();
    });
  });

  describe('사용자가 방에서 제거될 때', () => {
    it('사용자가 존재하면 성공적으로 제거된다.', async () => {
      const roomId = 1;
      const socketId = '12345';

      await studyRoomParticipantRepository.addUserToRoom(roomId, socketId);

      await studyRoomParticipantRepository.removeUserFromRoom(roomId, socketId);

      const result = await repository.findOne({
        where: { socket_id: socketId, room_id: roomId },
      });

      expect(result).toBeNull();
    });

    it('사용자가 존재하지 않으면 예외를 발생시킨다.', async () => {
      const roomId = 1;
      const socketId = '99999';

      await expect(
        studyRoomParticipantRepository.removeUserFromRoom(roomId, socketId),
      ).rejects.toThrow('Participant not found in the room');
    });
  });

  describe('특정 방의 모든 사용자를 조회할 때', () => {
    it('방의 모든 사용자 정보를 반환한다.', async () => {
      const roomId = 1;
      const participants = [
        { socketId: '12345', roomId },
        { socketId: '67890', roomId },
      ];

      for (const participant of participants) {
        await studyRoomParticipantRepository.addUserToRoom(
          participant.roomId,
          participant.socketId,
        );
      }

      const result = await studyRoomParticipantRepository.getRoomUsers(roomId);

      expect(result).toEqual([{ socketId: '12345' }, { socketId: '67890' }]);
    });
  });
});
