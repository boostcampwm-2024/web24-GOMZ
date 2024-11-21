import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as ioClient from 'socket.io-client';
import { SignalingServerGateway } from '../src/signaling-server/signaling-server.gateway';
import { StudyRoomsService } from '../src/study-room/study-room.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../winston.config';

describe('시그널링 서버 e2e 테스트', () => {
  let app: INestApplication;
  let oldClient: ioClient.Socket;
  let newClient: ioClient.Socket;

  beforeAll(async () => {
    const mockStudyRoomService = {
      rooms: { 1: [] },
      getRoomUsers(roomId) {
        return this.rooms[roomId];
      },
      findUserRoom(socketId) {
        return Object.keys(this.rooms).find((roomId) =>
          this.rooms[roomId].some((user) => user.socketId === socketId),
        );
      },
      addUserToRoom(roomId, socketId) {
        this.rooms[roomId] ??= [];
        this.rooms[roomId].push({ socketId });
      },
      removeUserFromRoom(roomId, socketId) {
        this.rooms[roomId] = this.rooms[roomId].filter((user) => user.socketId !== socketId);
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [WinstonModule.forRoot(winstonConfig)],
      providers: [
        SignalingServerGateway,
        { provide: StudyRoomsService, useValue: mockStudyRoomService },
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
        oldClient.emit('sendIceCandidate', { targetId: newId, iceCandidate: 'OldIceCandidate' });
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
        newClient.emit('sendIceCandidate', { targetId: oldId, iceCandidate: 'NewIceCandidate' });
      });
      newClient.on('setIceCandidate', ({ iceCandidate }) => {
        expect(iceCandidate).toBe('OldIceCandidate'); // 기존 참가자가 보낸 icecandidate여야함
      });
      newClient.on('userDisconnected', ({ targetId }) => {
        expect(typeof targetId).toBe('string');
        expect(targetId).not.toBe(newClient.id);
        newClient.disconnect();
        resolve();
      });
    }));
});
