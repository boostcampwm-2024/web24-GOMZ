import { Test, TestingModule } from '@nestjs/testing';
import { ChattingServerGateway } from './chatting-server.gateway';
import { StudyRoomsService } from '../study-room/study-room.service';
import { Server, Socket } from 'socket.io';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

describe('ChattingServerGateway 테스트', () => {
  let gateway: ChattingServerGateway;
  let studyRoomsService: StudyRoomsService;
  let mockSocket: Partial<Socket>;
  let logger: Logger;

  beforeEach(async () => {
    const loggerMock = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingServerGateway,
        {
          provide: StudyRoomsService,
          useValue: {
            createRoom: jest.fn(),
            findRoom: jest.fn(),
            addUserToRoom: jest.fn(),
            removeUserFromRoom: jest.fn(),
            leaveAllRooms: jest.fn(),
            findUserRoom: jest.fn(),
            getRoomUsers: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: loggerMock,
        },
      ],
    }).compile();

    gateway = module.get<ChattingServerGateway>(ChattingServerGateway);
    studyRoomsService = module.get<StudyRoomsService>(StudyRoomsService);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);

    // server 객체를 수동으로 모킹합니다.
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;

    mockSocket = {
      id: 'socket1',
      join: jest.fn(),
      leave: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any,
      emit: jest.fn(),
    };
  });

  describe('사용자가 연결되었을 때', () => {
    it('사용자가 접속하면 로그가 출력된다', () => {
      gateway.handleConnection(mockSocket as Socket);
      expect(logger.info).toHaveBeenCalledWith('socket1 접속!');
    });
  });

  describe('사용자가 연결 해제되었을 때', () => {
    it('사용자가 접속 해제 시 모든 방에서 제거된다', () => {
      gateway.handleDisconnect(mockSocket as Socket);
      expect(studyRoomsService.leaveAllRooms).toHaveBeenCalledWith('socket1');
      expect(logger.info).toHaveBeenCalledWith('socket1 접속 해제!');
    });
  });

  describe('사용자가 방에 참가 요청을 할 때', () => {
    it('방이 없으면 새로 생성하고 사용자를 추가한다', () => {
      (studyRoomsService.findRoom as jest.Mock).mockReturnValue(undefined);

      gateway.handleJoinRoom(mockSocket as Socket, 'room1');

      expect(studyRoomsService.createRoom).toHaveBeenCalledWith('room1');
      expect(studyRoomsService.addUserToRoom).toHaveBeenCalledWith('room1', 'socket1');
      expect(mockSocket.join).toHaveBeenCalledWith('room1');
      expect(logger.info).toHaveBeenCalledWith('socket1님이 방 room1에 입장했습니다.');
    });

    it('방에 사용자 추가 후 다른 사용자들에게 알림', () => {
      (studyRoomsService.findRoom as jest.Mock).mockReturnValue({});

      gateway.handleJoinRoom(mockSocket as Socket, 'room1');

      expect(gateway.server.to('room1').emit).toHaveBeenCalledWith(
        'userJoined',
        JSON.stringify({ userId: 'socket1' }),
      );
    });
  });

  describe('사용자가 방에서 나갈 때', () => {
    it('사용자가 방에서 나가면 방 목록에서 제거된다', () => {
      gateway.handleLeaveRoom(mockSocket as Socket, 'room1');
      expect(studyRoomsService.removeUserFromRoom).toHaveBeenCalledWith('room1', 'socket1');
      expect(mockSocket.leave).toHaveBeenCalledWith('room1');
      expect(logger.info).toHaveBeenCalledWith('socket1님이 방 room1에서 나갔습니다.');
    });

    it('다른 사용자들에게 퇴장 알림을 전송한다', () => {
      gateway.handleLeaveRoom(mockSocket as Socket, 'room1');
      expect(gateway.server.to('room1').emit).toHaveBeenCalledWith(
        'userLeft',
        JSON.stringify({ userId: 'socket1' }),
      );
    });
  });

  describe('메시지 전송', () => {
    it('사용자가 속한 방이 없으면 메시지를 전송하지 않는다', () => {
      (studyRoomsService.findUserRoom as jest.Mock).mockReturnValue(undefined);

      gateway.handleSendMessage(mockSocket as Socket, 'Hello');
      expect(logger.info).toHaveBeenCalledWith('사용자 socket1가 속한 방이 없습니다.');
    });

    it('사용자가 속한 방에 메시지를 전송한다', () => {
      (studyRoomsService.findUserRoom as jest.Mock).mockReturnValue('room1');

      gateway.handleSendMessage(mockSocket as Socket, 'Hello');
      expect(mockSocket.broadcast.to('room1').emit).toHaveBeenCalledWith('receiveMessage', {
        userId: 'socket1',
        message: 'Hello',
      });
    });
  });
});
