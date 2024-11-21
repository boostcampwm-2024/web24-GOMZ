import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { StudyRoom } from './entity/study-room.entity';
import { StudyRoomRepository } from './repository/study-room.repository';
import { StudyRoomParticipantRepository } from './repository/study-room-participant.repository';

@Injectable()
export class StudyRoomsService {
  constructor(
    private readonly roomRepository: StudyRoomRepository,
    private readonly participantRepository: StudyRoomParticipantRepository,
  ) {}

  /**
   * 새로운 방을 생성합니다.
   * @param roomName 방 ID
   * @param clientId 생성자 ID
   * @returns 생성된 방
   */
  // TODO 생성된 방 entity를 그대로 주는 것보다 방 생성 성공 여부를 가르는 것은 어떤가요.
  // TODO 나중에는 카테고리 ID도 필요해요.
  async createRoom(roomName: string, password: string, categoryName: string): Promise<StudyRoom> {
    const studyRoom = await this.roomRepository.createRoom(roomName, password, categoryName);
    return studyRoom;
  }

  /**
   * 방을 조회합니다.
   * @param roomId 방 ID
   * @returns 방 객체 또는 undefined
   */
  async findRoom(roomId: string): Promise<StudyRoom | null> {
    const room = await this.roomRepository.findRoom(parseInt(roomId, 10));
    return room || undefined; // null 대신 undefined로 반환
  }

  /**
   * 사용자를 방에 추가합니다.
   * @param roomId 방 ID
   * @param socketId 소켓 ID
   */
  async addUserToRoom(roomId: string, socketId: string): Promise<void> {
    await this.isValidRoom(roomId);
    await this.participantRepository.addUserToRoom(parseInt(roomId, 10), socketId);
  }

  /**
   * 사용자를 방에서 제거합니다.
   * @param roomId 방 ID
   * @param socketId 소켓 ID
   */
  async removeUserFromRoom(roomId: string, socketId: string): Promise<void> {
    await this.isValidRoom(roomId);
    await this.isValidParticipant(socketId);
    await this.participantRepository.removeUserFromRoom(parseInt(roomId, 10), socketId);
  }

  /**
   * 특정 방의 모든 사용자를 조회합니다.
   * @param roomId 방 ID
   * @returns 방에 있는 사용자의 목록
   */
  async getRoomUsers(roomId: string): Promise<{ socketId: string }[]> {
    return await this.participantRepository.getRoomUsers(parseInt(roomId, 10));
  }

  /**
   * 특정 사용자를 모든 방에서 제거합니다.
   * @param socketId 클라이언트 ID
   */
  async leaveAllRooms(socketId: string): Promise<void> {
    await this.participantRepository.leaveAllRooms(socketId);
  }

  /**
   * 사용자가 속한 방 찾기
   * @param clientId 클라이언트 ID
   * @returns 사용자가 속한 방 ID 또는 undefined
   */
  async findUserRoom(clientId: string): Promise<string | null> {
    const rooms = await this.participantRepository.getAllRooms();
    return Object.keys(rooms).find((roomId) =>
      rooms[roomId].some((user) => user.socketId === clientId),
    );
  }

  /**
   * 존재하는 모든 방을 조회합니다.
   */
  async getAllRoom(): Promise<
    { roomId: string; roomName: string; users: { socketId: string }[] }[]
  > {
    const allRooms = await this.participantRepository.getAllRooms();

    return await Promise.all(
      Object.keys(allRooms).map(async (roomId) => {
        const room = await this.roomRepository.findRoom(parseInt(roomId, 10));
        return {
          roomId,
          roomName: room.room_name,
          users: allRooms[roomId],
        };
      }),
    );
  }

  private async isValidRoom(roomId: string): Promise<void> {
    const room = await this.roomRepository.findRoom(parseInt(roomId, 10));
    if (!room) {
      this.roomRepository.createRoom('테스트용 방', 0);
      // throw new Error('Room not found');
    }
  }

  private async isValidParticipant(socketId: string): Promise<void> {
    const participant = await this.participantRepository.findParticipant(socketId);
    if (!participant) {
      throw new Error('participant not found');
    }
  }

  /**
   * 선택한 방에 입장가능여부 체크
   * @param password 사용자 입력 패스워드
   * @param roomId 들어가려는 방 ID
   */
  async checkAccess(password: string, roomId: number) {
    // 방 존재여부 체크
    const studyRoom = await this.roomRepository.findRoom(roomId);
    if (!studyRoom) {
      throw new NotFoundException('No such study room');
    }

    // 비밀번호 체크
    if (studyRoom.password && password !== studyRoom.password) {
      throw new UnauthorizedException('Passwords do not match');
    }

    return true;
  }
}
