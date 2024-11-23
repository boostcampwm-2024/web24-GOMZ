import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { StudyRoomController } from './study-room.controller';
import { StudyRoomsService } from './study-room.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CreateRoomRequestDto, CreateRoomResponseDto } from './dto/create-room.dto';
import { RoomInfoResponseDto } from './dto/read-room.dto';
import { CheckAccessRequestDto } from './dto/create-room.dto';

describe('StudyRoomController (e2e)', () => {
  let app: INestApplication;
  const mockStudyRoomsService = {
    createRoom: jest.fn(),
    getAllRoom: jest.fn(),
    checkAccess: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StudyRoomController],
      providers: [
        {
          provide: StudyRoomsService,
          useValue: mockStudyRoomsService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /study-room/create', () => {
    it('방을 성공적으로 생성해야 한다.', async () => {
      // given
      const createRoomDto: CreateRoomRequestDto = {
        roomName: 'Test Room',
        password: '1234',
        categoryName: 'Study',
      };
      const createRoomResponse: CreateRoomResponseDto = { roomId: 1 };
      mockStudyRoomsService.createRoom.mockResolvedValue(createRoomResponse);

      // when
      const response = await request(app.getHttpServer())
        .post('/study-room/create')
        .send(createRoomDto)
        .expect(201);

      // then
      expect(response.body).toEqual(createRoomResponse);
    });
  });

  describe('GET /study-room/rooms', () => {
    it('모든 방 정보를 반환해야 한다.', async () => {
      // given
      const mockRooms: RoomInfoResponseDto[] = [
        {
          roomId: 1,
          roomName: 'Room 1',
          categoryName: 'Study',
          isPrivate: false,
          curParticipant: 5,
          maxParticipant: 10,
        },
        {
          roomId: 2,
          roomName: 'Room 2',
          categoryName: 'Programming',
          isPrivate: true,
          curParticipant: 3,
          maxParticipant: 8,
        },
      ];
      mockStudyRoomsService.getAllRoom.mockResolvedValue(mockRooms);

      // when
      const response = await request(app.getHttpServer()).get('/study-room/rooms').expect(200);

      // then
      expect(response.body).toEqual(mockRooms);
    });
  });

  describe('GET /study-room/check', () => {
    it('올바른 비밀번호면, 방 접근을 허용해야 한다.', async () => {
      // given
      const checkAccessDto: CheckAccessRequestDto = {
        password: '1234',
        roomId: 1,
      };
      mockStudyRoomsService.checkAccess.mockResolvedValue(true);

      // when
      const response = await request(app.getHttpServer())
        .get('/study-room/check')
        .query(checkAccessDto)
        .expect(200);

      // then
      expect(response.body).toEqual({ canAccess: true });
    });

    it('잘못된 비밀번호면, 방 접근을 거부해야 한다.', async () => {
      // given
      const checkAccessDto: CheckAccessRequestDto = {
        password: 'wrong-password',
        roomId: 1,
      };
      mockStudyRoomsService.checkAccess.mockRejectedValue(new Error('Access denied'));

      // when
      const response = await request(app.getHttpServer())
        .get('/study-room/check')
        .query(checkAccessDto)
        .expect(200);

      // then
      expect(response.body).toHaveProperty('canAccess', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
