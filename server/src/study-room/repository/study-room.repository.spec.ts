import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomRepository } from './study-room.repository';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { StudyRoom } from '../entity/study-room.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('Study Room 레포지토리 테스트', () => {
  let studyRoomRepository: StudyRoomRepository;
  let repository: Repository<StudyRoom>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // 테스트를 위한 MySQL 데이터베이스 사용
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DATABASE_TEST_HOST,
          port: Number(process.env.DATABASE_TEST_PORT),
          username: process.env.DATABASE_TEST_USER,
          password: process.env.DATABASE_TEST_PASSWORD,
          database: process.env.DATABASE_TEST_NAME,
          entities: [StudyRoom],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([StudyRoom]),
      ],
      providers: [StudyRoomRepository],
    }).compile();

    studyRoomRepository = module.get<StudyRoomRepository>(StudyRoomRepository);
    repository = module.get<Repository<StudyRoom>>(getRepositoryToken(StudyRoom));
  });

  afterEach(async () => {
    await repository.query('DROP TABLE study_room;');
    await repository.manager.connection.destroy();
  });

  describe('사용자가 방을 생성할 때', () => {
    it('방이 성공적으로 생성된다.', async () => {
      const roomName = '테스트 스터디 그룹입니다.';
      const categoryId = 1;

      // 방 생성
      const result = await studyRoomRepository.createRoom(roomName, categoryId);

      // 검증
      expect(result).toBeDefined();
      expect(result.room_id).toBeDefined();
      expect(result.room_name).toEqual(roomName);
      expect(result.category_id).toEqual(categoryId);
      expect(result.created_at).toBeDefined();

      // 데이터베이스에 방이 존재하는지 확인
      const foundRoom = await repository.findOne({ where: { room_id: result.room_id } });
      expect(foundRoom).toBeDefined();
      expect(foundRoom.room_name).toEqual(roomName);
      expect(foundRoom.category_id).toEqual(categoryId);
    });
  });

  describe('방 ID로 방을 찾을 때', () => {
    it('방이 존재하면 방을 반환한다.', async () => {
      const roomName = 'Math Study Room';
      const categoryId = 1;

      // 생성된 방 추가
      const expectedRoom = await studyRoomRepository.createRoom(roomName, categoryId);

      // 실행
      const result = await studyRoomRepository.findRoom(expectedRoom.room_id);

      // 검증
      expect(result).toBeDefined();
      expect(result.room_id).toEqual(expectedRoom.room_id);
      expect(result.room_name).toEqual(roomName);
      expect(result.category_id).toEqual(categoryId);
    });

    it('방이 존재하지 않으면 undefined를 반환한다.', async () => {
      const roomId = 999;

      // 실행
      const result = await studyRoomRepository.findRoom(roomId);

      // 검증
      expect(result).toBeNull();
    });
  });
});
