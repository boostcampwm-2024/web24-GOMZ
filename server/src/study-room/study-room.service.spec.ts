import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomsService } from './study-room.service';
import { StudyRoomRepository } from './repository/study-room.repository';
import { StudyRoomParticipantRepository } from './repository/study-room-participant.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  CreateRoomRequestDto,
  CreateRoomResponseDto,
  CheckAccessRequestDto,
} from './dto/create-room.dto';
import { RoomInfoResponseDto } from './dto/read-room.dto';

describe('Study Room 서비스 테스트', () => {
  let service: StudyRoomsService;
  let roomRepository: jest.Mocked<StudyRoomRepository>;
  let participantRepository: jest.Mocked<StudyRoomParticipantRepository>;

  const mockRoom = {
    room_id: 1,
    room_name: 'Test Room',
    password: '1234',
    category_name: 'Study',
    created_at: new Date(),
    setCreatedAt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyRoomsService,
        {
          provide: StudyRoomRepository,
          useValue: {
            findAllRooms: jest.fn(),
            findRoomById: jest.fn(),
            saveRoom: jest.fn(),
          },
        },
        {
          provide: StudyRoomParticipantRepository,
          useValue: {
            saveParticipant: jest.fn(),
            findParticipantBySocketId: jest.fn(),
            findParticipantsByRoomId: jest.fn(),
            findRoomIdBySocketId: jest.fn(),
            deleteParticipantBySocketId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudyRoomsService>(StudyRoomsService);
    roomRepository = module.get(StudyRoomRepository) as jest.Mocked<StudyRoomRepository>;
    participantRepository = module.get(
      StudyRoomParticipantRepository,
    ) as jest.Mocked<StudyRoomParticipantRepository>;
  });

  describe('createRoom', () => {
    it('새로운 방을 성공적으로 생성해야 한다.', async () => {
      // given
      const createRoomDto = new CreateRoomRequestDto('Test Room', '1234', 'Study');
      roomRepository.saveRoom.mockResolvedValue(mockRoom);

      // when
      const result = await service.createRoom(createRoomDto);

      // then
      expect(result).toEqual(new CreateRoomResponseDto(mockRoom.room_id));
    });
  });

  describe('checkAccess', () => {
    it('올바른 비밀번호로 방 접근을 허용해야 한다.', async () => {
      // given
      const checkAccessDto = new CheckAccessRequestDto('1234', 1);
      roomRepository.findRoomById.mockResolvedValue(mockRoom);

      // when
      const result = await service.checkAccess(checkAccessDto);

      // then
      expect(result).toBe(true);
    });

    it('방이 존재하지 않으면 예외를 던져야 한다.', async () => {
      // given
      const checkAccessDto = new CheckAccessRequestDto('1234', 1);
      roomRepository.findRoomById.mockResolvedValue(null);

      // when
      const testFn = () => service.checkAccess(checkAccessDto);

      // then
      await expect(testFn).rejects.toThrow(NotFoundException);
    });

    it('잘못된 비밀번호로 방 접근을 거부해야 한다.', async () => {
      // given
      const checkAccessDto = new CheckAccessRequestDto('wrong-password', 1);
      roomRepository.findRoomById.mockResolvedValue(mockRoom);

      // when
      const testFn = () => service.checkAccess(checkAccessDto);

      // then
      await expect(testFn).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAllRoom', () => {
    it('모든 방 정보를 반환해야 한다.', async () => {
      // given
      const mockParticipants = [{ socketId: 'socket1' }, { socketId: 'socket2' }];
      const mockRoomEntity = [mockRoom];
      roomRepository.findAllRooms.mockResolvedValue(mockRoomEntity);
      participantRepository.findParticipantsByRoomId.mockResolvedValue(mockParticipants);

      // when
      const result = await service.getAllRoom();

      // then
      expect(result).toEqual([new RoomInfoResponseDto(mockRoomEntity[0], 1, 2, 8)]);
    });
  });
});
