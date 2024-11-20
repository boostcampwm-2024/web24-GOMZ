import { Test, TestingModule } from '@nestjs/testing';
import { StudyRoomsService } from '../study-room/study-room.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { SignalingServerGateway } from './signaling-server.gateway';

jest.mock('socket.io');

describe('SignalingServerGateway', () => {
  let gateway: SignalingServerGateway;
  let studyRoomsService: StudyRoomsService;
  let logger: Logger;
  let mockServer: Server;
  let mockClient: Socket;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as jest.Mocked<Server>;

    mockClient = {
      id: 'mockClientId',
      emit: jest.fn(),
    } as unknown as jest.Mocked<Socket>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalingServerGateway,
        {
          provide: StudyRoomsService,
          useValue: {
            addUserToRoom: jest.fn(),
            getRoomUsers: jest.fn(),
            leaveAllRooms: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            info: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<SignalingServerGateway>(SignalingServerGateway);
    studyRoomsService = module.get<StudyRoomsService>(StudyRoomsService);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);

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

      expect(logger.info).toHaveBeenCalledWith(`${mockClient.id} 접속!!!`);
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

      expect(logger.info).toHaveBeenCalledWith(`${mockClient.id} 접속해제!!!`);
      expect(studyRoomsService.leaveAllRooms).toHaveBeenCalledWith(mockClient.id);
    });
  });

  describe('신규 참가자가 Offer를 보낼 때', () => {
    it('기존 참가자에게 Answer Request를 보낸다.', () => {
      const offer = { type: 'offer', sdp: 'mockSDP' } as RTCSessionDescriptionInit;
      const oldId = 'oldUserId';
      const newRandomId = 'newRandomId';

      gateway.handleSendOffer(mockClient, offer, oldId, newRandomId);

      expect(logger.info).toHaveBeenCalledWith(
        `new user: ${mockClient.id}(${newRandomId}) sends an offer to old user: ${oldId}`,
      );
      expect(mockServer.to).toHaveBeenCalledWith(oldId);
      expect(mockServer.to(oldId).emit).toHaveBeenCalledWith('answerRequest', {
        newId: mockClient.id,
        offer,
        newRandomId,
      });
    });
  });

  describe('기존 참가자가 Answer를 보낼 때', () => {
    it('신규 참가자에게 completeConnection을 보낸다.', () => {
      const answer = { type: 'answer', sdp: 'mockSDP' } as RTCSessionDescriptionInit;
      const newId = 'newUserId';
      const oldRandomId = 'oldRandomId';

      gateway.handleSendAnswer(mockClient, answer, newId, oldRandomId);

      expect(logger.info).toHaveBeenCalledWith(
        `old user: ${mockClient.id}(${oldRandomId}) sends an answer to new user: ${newId}`,
      );
      expect(mockServer.to).toHaveBeenCalledWith(newId);
      expect(mockServer.to(newId).emit).toHaveBeenCalledWith('completeConnection', {
        oldId: mockClient.id,
        answer,
        oldRandomId,
      });
    });
  });

  describe('ICE 후보키를 요청할 때', () => {
    it('원하는 유저에게 ICE candidate를 보낸다.', () => {
      const targetId = 'targetUserId';
      const candidate = { candidate: 'mockCandidate' } as RTCIceCandidateInit;

      gateway.handleSendIceCandidate(mockClient, targetId, candidate);

      expect(logger.info).toHaveBeenCalledWith(
        `user: ${mockClient.id} sends ICE candidate to user: ${targetId}`,
      );
      expect(mockServer.to).toHaveBeenCalledWith(targetId);
      expect(mockServer.to(targetId).emit).toHaveBeenCalledWith('setIceCandidate', {
        senderId: mockClient.id,
        iceCandidate: candidate,
      });
    });
  });
});
