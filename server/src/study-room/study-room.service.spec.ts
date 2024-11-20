import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomsService } from './study-room.service';
import { StudyRoomRepository } from './repository/study-room.repository';
import { StudyRoomParticipantRepository } from './repository/study-room-participant.repository';
import { StudyRoom } from './entity/study-room.entity';
import { StudyRoomParticipant } from './entity/study-room-participant.entity';

describe('Study Room 서비스 테스트', () => {
  let service: StudyRoomsService;
  let roomRepository: StudyRoomRepository;
  let participantRepository: StudyRoomParticipantRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyRoomsService,
        {
          provide: StudyRoomRepository,
          useValue: {
            createRoom: jest.fn(),
            findRoom: jest.fn(),
          },
        },
        {
          provide: StudyRoomParticipantRepository,
          useValue: {
            addUserToRoom: jest.fn(),
            removeUserFromRoom: jest.fn(),
            findParticipant: jest.fn(),
            getRoomUsers: jest.fn(),
            leaveAllRooms: jest.fn(),
            getAllRooms: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudyRoomsService>(StudyRoomsService);
    roomRepository = module.get<StudyRoomRepository>(StudyRoomRepository);
    participantRepository = module.get<StudyRoomParticipantRepository>(
      StudyRoomParticipantRepository,
    );
  });

  describe('방 생성을 요청할 때', () => {
    it('방을 생성하고 사용자도 추가한다.', async () => {
      const roomName = 'Test Room';
      const clientId = 'socket123';

      const mockStudyRoom: StudyRoom = {
        room_id: 1,
        room_name: roomName,
        category_id: 0,
        created_at: new Date(),
        setCreatedAt: jest.fn(),
        password: '',
      };

      jest.spyOn(roomRepository, 'createRoom').mockResolvedValue(mockStudyRoom);
      jest.spyOn(participantRepository, 'addUserToRoom').mockResolvedValue();

      const result = await service.createRoom(roomName, clientId);

      expect(roomRepository.createRoom).toHaveBeenCalledWith(roomName, 0);
      expect(participantRepository.addUserToRoom).toHaveBeenCalledWith(1, clientId);
      expect(result).toEqual(mockStudyRoom);
    });
  });

  describe('방 검색을 요청할 때', () => {
    it('존재하는 방을 반환한다.', async () => {
      const roomId = '1';

      const mockStudyRoom: StudyRoom = {
        room_id: 1,
        room_name: 'Test Room',
        category_id: 0,
        created_at: new Date(),
        setCreatedAt: jest.fn(),
        password: '',
      };

      jest.spyOn(roomRepository, 'findRoom').mockResolvedValue(mockStudyRoom);

      const result = await service.findRoom(roomId);

      expect(roomRepository.findRoom).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStudyRoom);
    });

    it('존재하지 않는 방은 undefined를 반환한다.', async () => {
      const roomId = '999';

      jest.spyOn(roomRepository, 'findRoom').mockResolvedValue(undefined);

      const result = await service.findRoom(roomId);

      expect(roomRepository.findRoom).toHaveBeenCalledWith(999);
      expect(result).toBeUndefined();
    });
  });

  describe('방에 사용자 추가를 요청할 때', () => {
    it('유효한 방에 사용자를 추가한다.', async () => {
      const roomId = '1';
      const socketId = 'socket123';

      jest.spyOn(roomRepository, 'findRoom').mockResolvedValue({} as StudyRoom);
      jest.spyOn(participantRepository, 'addUserToRoom').mockResolvedValue();

      await service.addUserToRoom(roomId, socketId);

      expect(roomRepository.findRoom).toHaveBeenCalledWith(1);
      expect(participantRepository.addUserToRoom).toHaveBeenCalledWith(1, socketId);
    });
  });

  describe('방에서 사용자 제거를 요청할 때', () => {
    it('유효한 방과 참가자를 제거한다.', async () => {
      const roomId = '1';
      const socketId = 'socket123';

      jest.spyOn(roomRepository, 'findRoom').mockResolvedValue({} as StudyRoom);
      jest.spyOn(participantRepository, 'findParticipant').mockResolvedValue({
        socket_id: 'socket123',
        room_id: 1,
      } as StudyRoomParticipant);
      jest.spyOn(participantRepository, 'removeUserFromRoom').mockResolvedValue();

      await service.removeUserFromRoom(roomId, socketId);

      expect(roomRepository.findRoom).toHaveBeenCalledWith(1);
      expect(participantRepository.findParticipant).toHaveBeenCalledWith(socketId);
      expect(participantRepository.removeUserFromRoom).toHaveBeenCalledWith(1, socketId);
    });

    it('유효하지 않은 참가자를 제거하려고 하면 예외를 던진다.', async () => {
      const roomId = '1';
      const socketId = 'socket999';

      jest.spyOn(roomRepository, 'findRoom').mockResolvedValue({} as StudyRoom);
      jest.spyOn(participantRepository, 'findParticipant').mockResolvedValue(undefined);

      await expect(service.removeUserFromRoom(roomId, socketId)).rejects.toThrow(
        'participant not found',
      );
    });
  });

  describe('사용자가 속한 방 정보를 요청할 때', () => {
    it('사용자가 속한 방 ID를 반환한다.', async () => {
      const clientId = 'socket123';
      const mockRooms = {
        '1': [{ socketId: 'socket123' }],
        '2': [{ socketId: 'socket456' }],
      };

      jest.spyOn(participantRepository, 'getAllRooms').mockResolvedValue(mockRooms);

      const result = await service.findUserRoom(clientId);

      expect(participantRepository.getAllRooms).toHaveBeenCalled();
      expect(result).toBe('1');
    });

    it('사용자가 속한 방이 없으면 undefined를 반환한다.', async () => {
      const clientId = 'socket999';
      const mockRooms = {
        '1': [{ socketId: 'socket123' }],
        '2': [{ socketId: 'socket456' }],
      };

      jest.spyOn(participantRepository, 'getAllRooms').mockResolvedValue(mockRooms);

      const result = await service.findUserRoom(clientId);

      expect(participantRepository.getAllRooms).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
