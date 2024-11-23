import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as ioClient from 'socket.io-client';
import { SignalingServerGateway } from '../src/signaling-server/signaling-server.gateway';
import { StudyRoomsService } from '../src/study-room/study-room.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../winston.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyRoom } from '../src/study-room/entity/study-room.entity';
import { StudyRoomParticipant } from '../src/study-room/entity/study-room-participant.entity';
import { StudyRoomRepository } from '../src/study-room/repository/study-room.repository';
import { StudyRoomParticipantRepository } from '../src/study-room/repository/study-room-participant.repository';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });
describe('시그널링 서버 e2e 테스트', () => {
  let app: INestApplication;
  let oldClient: ioClient.Socket;
  let newClient: ioClient.Socket;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        // TypeORM 설정
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DATABASE_TEST_HOST,
          port: Number(process.env.DATABASE_TEST_PORT),
          username: process.env.DATABASE_TEST_USER,
          password: process.env.DATABASE_TEST_PASSWORD,
          database: process.env.DATABASE_TEST_NAME,
          entities: [StudyRoom, StudyRoomParticipant],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([StudyRoom, StudyRoomParticipant]),
        WinstonModule.forRoot(winstonConfig),
      ],
      providers: [
        SignalingServerGateway,
        StudyRoomsService,
        StudyRoomRepository,
        StudyRoomParticipantRepository,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(3000);

    oldClient = ioClient.io('http://localhost:3000', { autoConnect: false });
    newClient = ioClient.io('http://localhost:3000', { autoConnect: false });
  });

  afterAll(async () => {
    await app.close(); // 애플리케이션 종료
  });

  it('WebRTC 시그널링 과정 테스트', (done) => {
    oldClient.connect();

    oldClient.on('connect', () => {
      oldClient.emit('joinRoom', { roomId: '1' });
    });

    oldClient.on('offerRequest', ({ users }) => {
      expect(users.length).toBe(0); // 참가자 0명 있어야함
      newClient.connect();
    });

    oldClient.on('answerRequest', ({ newId, offer, newRandomId }) => {
      expect(offer).toBe('TestSDPOffer'); // 신규 참가자가 보낸 Offer여야함
      expect(newRandomId).toBe('NewRandomId'); // 신규 참가자의 랜덤 ID여야함
      oldClient.emit('sendAnswer', {
        newId,
        answer: 'TestSDPAnswer',
        oldRandomId: 'OldRandomId',
      });
      oldClient.emit('sendIceCandidate', { targetId: newId, candidate: 'OldIceCandidate' });
    });

    oldClient.on('setIceCandidate', ({ iceCandidate }) => {
      expect(iceCandidate).toBe('NewIceCandidate'); // 신규 참가자가 보낸 icecandidate여야함
      oldClient.disconnect();
    });

    newClient.on('connect', () => {
      newClient.emit('joinRoom', { roomId: '1' });
    });

    newClient.on('offerRequest', ({ users }) => {
      expect(users.length).toBe(1); // 참가자 1명 있어야함
      newClient.emit('sendOffer', {
        oldId: users[0].socketId,
        offer: 'TestSDPOffer',
        newRandomId: 'NewRandomId',
      });
    });

    newClient.on('completeConnection', ({ oldId, answer, oldRandomId }) => {
      expect(answer).toBe('TestSDPAnswer'); // 기존 참가자가 보낸 Answer여야함
      expect(oldRandomId).toBe('OldRandomId'); // 기존 참가자의 랜덤 ID여야함
      newClient.emit('sendIceCandidate', { targetId: oldId, candidate: 'NewIceCandidate' });
    });

    newClient.on('setIceCandidate', ({ iceCandidate }) => {
      expect(iceCandidate).toBe('OldIceCandidate'); // 기존 참가자가 보낸 icecandidate여야함
    });

    newClient.on('userDisconnected', ({ targetId }) => {
      expect(typeof targetId).toBe('string');
      expect(targetId).not.toBe(newClient.id);
      newClient.disconnect();

      setTimeout(() => done(), 2000);
    });
  });
});
