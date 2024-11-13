import { Test, TestingModule } from '@nestjs/testing';
import { SignalingServerGateway } from './signaling-server.gateway';
import { StudyRoomsService } from '../study-room/study-room.service';
import { MockStudyRoomRepository } from '../study-room/mock.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Socket } from 'socket.io';

describe('SignalingServerGateway', () => {
  let gateway: SignalingServerGateway;
  let logger: Logger;
  let studyRoomsService: StudyRoomsService;

  beforeEach(async () => {
    // Mock Logger 생성
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const mockRepository = new MockStudyRoomRepository();
    studyRoomsService = new StudyRoomsService(mockRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalingServerGateway,
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
        { provide: StudyRoomsService, useValue: studyRoomsService },
      ],
    }).compile();

    gateway = module.get<SignalingServerGateway>(SignalingServerGateway);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('SignalingServerGateway가 정의되어야 합니다.', () => {
    expect(gateway).toBeDefined();
  });

  it('사용자가 접속하면 logger.info가 호출되어야 합니다.', () => {
    const clientMock = { id: 'user1', emit: jest.fn() } as unknown as Socket;
    gateway.handleConnection(clientMock);
    expect(logger.info).toHaveBeenCalledWith('user1 접속!!!');
  });

  it('사용자가 접속 해제하면 logger.info가 호출되어야 합니다.', () => {
    const clientMock = { id: 'user1' } as unknown as Socket;
    gateway.handleDisconnect(clientMock);
    expect(logger.info).toHaveBeenCalledWith('user1 접속해제!!!');
  });
});
