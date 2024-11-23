import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ChattingServerGateway } from './chatting-server.gateway';
import { ChattingServerService } from './chatting-server.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { io, Socket } from 'socket.io-client';

describe('Chatting Server 게이트웨이 테스트', () => {
  let app: INestApplication;
  let clientSocket1: Socket;
  let clientSocket2: Socket;

  const mockChattingServerService = {
    getRoomMemberSocketIdList: jest.fn(),
  };
  const TEST_PORT = 3001;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingServerGateway,
        {
          provide: ChattingServerService,
          useValue: mockChattingServerService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(TEST_PORT);

    clientSocket1 = io(`http://localhost:${TEST_PORT}`, { transports: ['websocket'] });
    clientSocket2 = io(`http://localhost:${TEST_PORT}`, { transports: ['websocket'] });

    await new Promise((resolve) => {
      let connectedCount = 0;
      const onConnect = () => {
        connectedCount += 1;
        if (connectedCount === 2) resolve(null);
      };

      clientSocket1.on('connect', onConnect);
      clientSocket2.on('connect', onConnect);
    });
  });

  afterAll(async () => {
    clientSocket1.disconnect();
    clientSocket2.disconnect();
    await app.close();
  });

  it('한 클라이언트는 다른 클라이언트에게 메시지를 보낼 수 있다.', (done) => {
    const mockMessage = '테스트 메시지입니다.';
    const mockSocketIdList = [clientSocket2.id];

    mockChattingServerService.getRoomMemberSocketIdList.mockResolvedValue(mockSocketIdList);

    clientSocket2.on('receiveMessage', (data) => {
      try {
        expect(data.userId).toBe(clientSocket1.id);
        expect(data.message).toBe(mockMessage);
        done();
      } catch (err) {
        done(err);
      }
    });

    clientSocket1.emit('sendMessage', { message: mockMessage });
  });
});
