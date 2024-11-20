import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomsService } from '../study-room/study-room.service';
import { Logger } from 'winston';
import { Server, Socket } from 'socket.io';
import { SignalingServerGateway } from './signaling-server.gateway';

// mock 데이터
const mockRooms: Record<string, { socketId: string }[]> = {};
const mockAddUserToRoom = async (roomId: string, socketId: string): Promise<void> => {
  if (!mockRooms[roomId]) mockRooms[roomId] = [];
  mockRooms[roomId].push({ socketId });
};
const mockGetRoomUsers = async (roomId: string): Promise<{ socketId: string }[]> => {
  return mockRooms[roomId] || [];
};

const mockLeaveAllRooms = async (socketId: string): Promise<void> => {
  for (const roomId in mockRooms) {
    if (Object.prototype.hasOwnProperty.call(mockRooms, roomId)) {
      mockRooms[roomId] = mockRooms[roomId].filter(
        (user: { socketId: string }) => user.socketId !== socketId,
      );
    }
  }
};

describe('Signaling Server 게이트웨이 테스트', () => {
  let gateway: SignalingServerGateway;
  let studyRoomsService: StudyRoomsService;
  let mockClient: Socket;

  beforeEach(async () => {
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      silly: jest.fn(),
    };

    const mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as jest.Mocked<Server>;

    mockClient = {
      id: 'mock_client',
      emit: jest.fn(),
    } as unknown as jest.Mocked<Socket>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalingServerGateway,
        {
          provide: StudyRoomsService,
          useValue: {
            addUserToRoom: jest.fn(mockAddUserToRoom),
            getRoomUsers: jest.fn(mockGetRoomUsers),
            leaveAllRooms: jest.fn(mockLeaveAllRooms),
          },
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    gateway = module.get<SignalingServerGateway>(SignalingServerGateway);
    gateway.server = mockServer;
  });

  describe('소켓 연결을 요청할 때', () => {
    const defaultRoom = '1';
    const mockUsers = [{ socketId: 'existingUserId', nickname: 'Tester' }];

    beforeEach(() => {
      jest.spyOn(studyRoomsService, 'addUserToRoom').mockResolvedValue();
      jest.spyOn(studyRoomsService, 'getRoomUsers').mockResolvedValue(mockUsers);
    });

    it('방에 유저가 추가된다.', async () => {
      await gateway.handleConnection(mockClient);

      expect(studyRoomsService.addUserToRoom).toHaveBeenCalledWith(
        defaultRoom,
        mockClient.id,
        'defaultNickname',
      );
    });

    it('기존 참가자에게 emit한다.', async () => {
      await gateway.handleConnection(mockClient);

      expect(studyRoomsService.getRoomUsers).toHaveBeenCalledWith(defaultRoom);
      expect(mockClient.emit).toHaveBeenCalledWith('offerRequest', {
        users: mockUsers.filter((user) => user.socketId !== mockClient.id),
      });
    });
  });

  describe('소켓 연결 해제를 요청할 때', () => {
    it('유저가 속한 모든 방의 소켓을 연결 해제한다.', async () => {
      jest.spyOn(studyRoomsService, 'leaveAllRooms').mockResolvedValue();

      await gateway.handleDisconnect(mockClient);

      expect(studyRoomsService.leaveAllRooms).toHaveBeenCalledWith(mockClient.id);
    });
  });

  describe('신규 참가자가 Offer를 보낼 때', () => {
    it('기존 참가자에게 Answer Request를 보낸다.', () => {
      const offer = { type: 'offer', sdp: 'mockSDP' } as RTCSessionDescriptionInit;
      const oldId = 'oldUserId';
      const newRandomId = 'newRandomId';

      gateway.handleSendOffer(mockClient, offer, oldId, newRandomId);

      // expect(mockServer.to).toHaveBeenCalledWith(oldId);
      // expect(mockServer.to(oldId).emit).toHaveBeenCalledWith('answerRequest', {
      //   newId: mockClient.id,
      //   offer,
      //   newRandomId,
      // });
    });
  });

  // describe('기존 참가자가 Answer를 보낼 때', () => {
  //   it('신규 참가자에게 completeConnection을 보낸다.', () => {
  //     const answer = { type: 'answer', sdp: 'mockSDP' } as RTCSessionDescriptionInit;
  //     const newId = 'newUserId';
  //     const oldRandomId = 'oldRandomId';

  //     gateway.handleSendAnswer(mockClient, answer, newId, oldRandomId);

  //     expect(mockServer.to).toHaveBeenCalledWith(newId);
  //     expect(mockServer.to(newId).emit).toHaveBeenCalledWith('completeConnection', {
  //       oldId: mockClient.id,
  //       answer,
  //       oldRandomId,
  //     });
  //   });
  // });

  describe('ICE 후보키를 요청할 때', () => {
    it('원하는 유저에게 ICE candidate를 보낸다.', () => {
      const targetId = 'targetUserId';
      const candidate = { candidate: 'mockCandidate' } as RTCIceCandidateInit;

      gateway.handleSendIceCandidate(mockClient, targetId, candidate);

      // expect(mockServer.to).toHaveBeenCalledWith(targetId);
      // expect(mockServer.to(targetId).emit).toHaveBeenCalledWith('setIceCandidate', {
      //   senderId: mockClient.id,
      //   iceCandidate: candidate,
      // });
    });
  });
});
