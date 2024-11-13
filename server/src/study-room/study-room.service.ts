import { Injectable } from '@nestjs/common';
import { MockStudyRoomRepository } from './mock.repository';
import { StudyRoom } from './study-room.entity';

@Injectable()
export class StudyRoomsService {
  constructor(private readonly roomRepository: MockStudyRoomRepository) {}

  /**
   * 새로운 방을 생성합니다.
   * @param roomId 방 ID
   * @returns 생성된 방
   */
  createRoom(roomId: string): StudyRoom {
    return this.roomRepository.createRoom(roomId);
  }

  /**
   * 방을 조회합니다.
   * @param roomId 방 ID
   * @returns 방 객체 또는 undefined
   */
  findRoom(roomId: string): StudyRoom | undefined {
    return this.roomRepository.findRoom(roomId);
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
}
