import { Injectable } from '@nestjs/common';
import { StudyRoom } from './study-room.entity';
import { StudyRoomRepository } from './study-room.repository';
import { StudyRoomParticipantRepository } from './study-room-participant.repository';

@Injectable()
export class StudyRoomsService {
  constructor(
    private readonly roomRepository: StudyRoomRepository,
    private readonly participantRepository: StudyRoomParticipantRepository,
  ) {}

  /**
   * 새로운 방을 생성합니다.
   * @param roomId 방 ID
   * @param clientId 생성자 ID
   * @returns 생성된 방
   */
  // TODO 생성된 방 entity를 그대로 주는 것보다 방 생성 성공 여부를 가르는 것은 어떤가요.
  // TODO 나중에는 카테고리 ID도 필요해요.
  createRoom(roomId: string, clientId: string, nickname: string): StudyRoom {
    const studyRoom = this.roomRepository.createRoom(roomId, 0);
    this.participantRepository.addUserToRoom(parseInt(roomId, 10), clientId, nickname);
    return studyRoom;
  }

  /**
   * 방을 조회합니다.
   * @param roomId 방 ID
   * @returns 방 객체 또는 undefined
   */
  async findRoom(roomId: string): Promise<StudyRoom | undefined> {
    const room = await this.roomRepository.findRoom(parseInt(roomId, 10));
    return room || undefined; // null 대신 undefined로 반환
  }

  /**
   * 사용자를 방에 추가합니다.
   * @param roomId 방 ID
   * @param clientId 클라이언트 ID
   */
  addUserToRoom(roomId: string, clientId: string) {
    this.roomRepository.addUserToRoom(roomId, clientId);
  }

  /**
   * 사용자를 방에서 제거합니다.
   * @param roomId 방 ID
   * @param clientId 클라이언트 ID
   */
  removeUserFromRoom(roomId: string, clientId: string) {
    this.roomRepository.removeUserFromRoom(roomId, clientId);
  }

  /**
   * 특정 방의 모든 사용자를 조회합니다.
   * @param roomId 방 ID
   * @returns 방에 있는 사용자의 목록
   */
  getRoomUsers(roomId: string): string[] {
    return this.roomRepository.getRoomUsers(roomId);
  }

  /**
   * 특정 사용자를 모든 방에서 제거합니다.
   * @param clientId 클라이언트 ID
   */
  leaveAllRooms(clientId: string) {
    this.roomRepository.leaveAllRooms(clientId);
  }

  /**
   * 사용자가 속한 방 찾기
   * @param clientId 클라이언트 ID
   * @returns 사용자가 속한 방 ID 또는 undefined
   */
  findUserRoom(clientId: string): string | undefined {
    const rooms = this.roomRepository.getAllRooms();
    return Object.keys(rooms).find((roomId) => rooms[roomId].includes(clientId));
  }

  /**
   * 존재하는 모든 방을 조회합니다.
   */
  getAllRoom(): { roomId: string; users: string[] }[] {
    const allRooms = this.roomRepository.getAllRooms();
    return Object.keys(allRooms).map((roomId) => ({
      roomId,
      users: allRooms[roomId],
    }));
  }
}
