import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as ioClient from 'socket.io-client';
import { SignalingServerGateway } from '../src/signaling-server/signaling-server.gateway';
import { StudyRoomsService } from '../src/study-room/study-room.service';
import { MockStudyRoomRepository } from '../src/study-room/mock.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});

describe('시그널링 서버 e2e 테스트', () => {
  let app: INestApplication;
  let oldClient: ioClient.Socket;
  let newClient: ioClient.Socket;

  beforeAll(async () => {
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignalingServerGateway,
        StudyRoomsService,
        MockStudyRoomRepository,
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(3000);

    oldClient = ioClient.io('http://localhost:3000', { autoConnect: false });
    newClient = ioClient.io('http://localhost:3000', { autoConnect: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('WebRTC 시그널링 과정 테스트', () =>
    new Promise<void>((resolve) => {
      oldClient.connect();

      oldClient.on('offerRequest', (data) => {
        const { users }: { users: string[] } = JSON.parse(data);
        expect(users.length).toBe(0); // 참가자 0명 있어야함
        newClient.connect();
      });
      oldClient.on('answerRequest', (data) => {
        const { newId, offer, newRandomId }: { newId: string; offer: string; newRandomId: string } =
          JSON.parse(data);
        expect(offer).toBe('TestSDPOffer'); // 신규 참가자가 보낸 Offer여야함
        expect(newRandomId).toBe('NewRandomId'); // 신규 참가자의 랜덤 ID여야함
        oldClient.emit('sendAnswer', {
          newId,
          answer: 'TestSDPAnswer',
          oldRandomId: 'OldRandomId',
        });
        oldClient.emit('sendIceCandidate', { targetId: newId, iceCandidate: 'OldIceCandidate' });
      });
      oldClient.on('setIceCandidate', (data) => {
        const { iceCandidate }: { iceCandidate: string } = JSON.parse(data);
        expect(iceCandidate).toBe('NewIceCandidate'); // 신규 참가자가 보낸 icecandidate여야함

        oldClient.disconnect();
        newClient.disconnect();
        resolve();
      });

      newClient.on('offerRequest', (data) => {
        const { users }: { users: string[] } = JSON.parse(data);
        expect(users.length).toBe(1); // 참가자 1명 있어야함
        newClient.emit('sendOffer', {
          oldId: users[0],
          offer: 'TestSDPOffer',
          newRandomId: 'NewRandomId',
        });
      });
      newClient.on('completeConnection', (data) => {
        const {
          oldId,
          answer,
          oldRandomId,
        }: { oldId: string; answer: string; oldRandomId: string } = JSON.parse(data);
        expect(answer).toBe('TestSDPAnswer'); // 기존 참가자가 보낸 Answer여야함
        expect(oldRandomId).toBe('OldRandomId'); // 기존 참가자의 랜덤 ID여야함
        newClient.emit('sendIceCandidate', { targetId: oldId, iceCandidate: 'NewIceCandidate' });
      });
      newClient.on('setIceCandidate', (data) => {
        const { iceCandidate }: { iceCandidate: string } = JSON.parse(data);
        expect(iceCandidate).toBe('OldIceCandidate'); // 기존 참가자가 보낸 icecandidate여야함
      });
    }));
});
