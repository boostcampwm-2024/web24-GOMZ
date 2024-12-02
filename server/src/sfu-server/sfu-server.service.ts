import { Injectable } from '@nestjs/common';
import { ChattingService } from 'src/chatting/chatting.service';
import { StudyRoomsService } from 'src/study-room/study-room.service';
import wrtc from '@roamhq/wrtc';

@Injectable()
export class SfuServerService {
  constructor(
    private readonly studyRoomsService: StudyRoomsService,
    private readonly chattingService: ChattingService,
  ) {}

  rooms = new Map<number, { timer?: NodeJS.Timeout }>();
  peerConnections = {};
  mediaStreams = {};
  config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  async enterRoom(socketId: string, roomId: string) {
    // 0. 방의 타이머를 설정한다.
    const room = this.getOrCreateRoom(roomId);
    this.resetRoomTimer(room);

    // 1. 방에 있는 기존 참가자들 정보를 가져온다.
    const users = await this.getFilteredRoomUsers(roomId, socketId);

    // 2. 방에 신규 참가자 정보를 넣는다.
    await this.studyRoomsService.addUserToRoom(roomId, socketId);
    return { users };
  }

  async exitRoom(socketId: string) {
    // 0. 방이 있는지 유효성 검사
    const roomId = await this.studyRoomsService.findUserRoom(socketId);
    if (!(await this.isValidRoomId(roomId))) return;

    // 1. 클라이언트 삭제
    await this.removeUserFromRoom(roomId, socketId);

    // 2. PeerConnection 삭제
    this.removePeerConnection(socketId);

    // 3. MediaStream 삭제
    const mediaStreamId = this.removeMediaStream(socketId);

    // 4. 방 타이머 설정
    const socketIdList = await this.handleRoomTimer(roomId);

    return { socketIdList, mediaStreamId };
  }

  async getRoomMemberSocketIdList(clientId: string) {
    return await this.chattingService.getRoomMemberSocketIdList(clientId);
  }

  async makePeerConnection(clientId: string) {
    // peerConnection을 생성하는 함수.
    // 반환값 : peerConnection
    const peerConnection = new wrtc.RTCPeerConnection(this.config);
    this.peerConnections[clientId] = peerConnection;

    return { peerConnection };
  }

  async makeAnswer(peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit) {
    // peerConnection을 기반으로 answer를 생성하는 함수
    // 반환값 : answer
    await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return { answer };
  }

  onTrack(clientId: string, peerConnection: RTCPeerConnection) {
    peerConnection.ontrack = (event) => {
      this.mediaStreams[clientId] = event.streams[0];
      // if(Object.keys(this.peerConnections).length > 1) sendOffer();
    };
  }

  async answerReceived(clientId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections[clientId];
    await peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(answer));
  }

  private getOrCreateRoom(roomId: string) {
    const parsedRoomId = parseInt(roomId, 10);
    if (!this.rooms.has(parsedRoomId)) {
      this.rooms.set(parsedRoomId, { timer: null });
    }
    return this.rooms.get(parsedRoomId);
  }

  private resetRoomTimer(room: { timer?: NodeJS.Timeout }) {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = undefined;
    }
  }

  private async removeUserFromRoom(roomId: string, socketId: string) {
    await this.studyRoomsService.removeUserFromRoom(roomId, socketId);
  }

  private removePeerConnection(socketId: string) {
    if (this.peerConnections[socketId]) {
      this.peerConnections[socketId].close();
      delete this.peerConnections[socketId];
    }
  }

  private removeMediaStream(socketId: string): string {
    const mediaStreamId = this.mediaStreams[socketId]?.id;
    if (this.mediaStreams[socketId]) {
      delete this.mediaStreams[socketId];
    }
    return mediaStreamId;
  }

  private async handleRoomTimer(roomId: string): Promise<string[]> {
    const users = await this.studyRoomsService.getRoomUsers(roomId);
    const room = this.rooms.get(parseInt(roomId, 10));

    if (!users.length && room) {
      room.timer = setTimeout(
        () => {
          this.rooms.delete(parseInt(roomId, 10));
          this.studyRoomsService.deleteRoom(roomId);
        },
        5 * 60 * 1000,
      );
    }

    return users.map((user) => user.socketId);
  }

  private async getFilteredRoomUsers(roomId: string, socketId: string) {
    const users = await this.studyRoomsService.getRoomUsers(roomId);
    return users.filter((user) => user.socketId !== socketId);
  }

  private async isValidRoomId(roomId: string) {
    return roomId;
  }
}
