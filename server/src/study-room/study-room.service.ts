import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { StudyRoom } from './entity/study-room.entity';
import { StudyRoomRepository } from './repository/study-room.repository';
import { StudyRoomParticipantRepository } from './repository/study-room-participant.repository';
import {
  CheckAccessRequestDto,
  CreateRoomRequestDto,
  CreateRoomResponseDto,
} from './dto/create-room.dto';
import { RoomInfoResponseDto } from './dto/read-room.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudyRoomsService {
  constructor(
    private readonly roomRepository: StudyRoomRepository,
    private readonly participantRepository: StudyRoomParticipantRepository,
  ) {}

  maxParticipant = 8;

  /**
   * 새로운 방을 생성합니다.
   * @param createRoomRequestDto.roomName 방 제목
   * @param createRoomRequestDto.password 방 비밀번호
   * @param createRoomRequestDto.categoryName 방 카테고리 명
   * @returns 생성된 방
   */
  async createRoom(createRoomRequestDto: CreateRoomRequestDto): Promise<CreateRoomResponseDto> {
    const { roomName, password, categoryName } = createRoomRequestDto;
    const hashedPassword = password ? await this.hashPassword(password) : null;
    const studyRoom = await this.roomRepository.saveRoom(roomName, hashedPassword, categoryName);
    const response = new CreateRoomResponseDto(studyRoom.room_id);
    return response;
  }

  /**
   * 방을 조회합니다.
   * @param roomId 방 ID
   * @returns 방 객체 또는 undefined
   */
  async findRoom(roomId: string): Promise<StudyRoom | null> {
    const room = await this.roomRepository.findRoomById(parseInt(roomId, 10));
    return room || undefined; // null 대신 undefined 반환
  }

  /**
   * 사용자를 방에 추가합니다.
   * @param roomId 방 ID
   * @param socketId 소켓 ID
   */
  async addUserToRoom(roomId: string, socketId: string): Promise<void> {
    await this.isValidRoom(roomId);
    await this.participantRepository.saveParticipant(parseInt(roomId, 10), socketId);
  }

  /**
   * 사용자를 방에서 제거합니다.
   * @param roomId 방 ID
   * @param socketId 소켓 ID
   */
  async removeUserFromRoom(roomId: string, socketId: string): Promise<void> {
    await this.isValidRoom(roomId);
    await this.isValidParticipant(socketId);
    await this.participantRepository.deleteParticipantBySocketId(parseInt(roomId, 10), socketId);
  }

  /**
   * 특정 방의 모든 사용자를 조회합니다.
   * @param roomId 방 ID
   * @returns 방에 있는 사용자의 목록
   */
  async getRoomUsers(roomId: string): Promise<{ socketId: string }[]> {
    return await this.participantRepository.findParticipantsByRoomId(parseInt(roomId, 10));
  }

  /**
   * 사용자가 속한 방 찾기
   * @param clientId 클라이언트 ID
   * @returns 사용자가 속한 방 ID 또는 undefined
   */
  async findUserRoom(clientId: string): Promise<string | null> {
    const roomId = await this.participantRepository.findRoomIdBySocketId(clientId);

    return roomId.toString() || null;
  }

  /**
   * 존재하는 모든 방을 조회합니다.
   */
  async getAllRoom(): Promise<RoomInfoResponseDto[]> {
    const roomList = await this.roomRepository.findAllRooms();

    const roomInfoResponseDtoList = [];
    for (const roomInfo of roomList) {
      const roomId = roomInfo.room_id;
      const roomParticipants = await this.participantRepository.findParticipantsByRoomId(roomId);
      const curParticipant = roomParticipants.length;
      const maxParticipant = this.maxParticipant;
      const roomInfoResponseDto = new RoomInfoResponseDto(
        roomInfo,
        roomId,
        curParticipant,
        maxParticipant,
      );
      roomInfoResponseDtoList.push(roomInfoResponseDto);
    }

    return roomInfoResponseDtoList;
  }

  private async isValidRoom(roomId: string): Promise<void> {
    const room = await this.roomRepository.findRoomById(parseInt(roomId, 10));
    if (!room) {
      await this.roomRepository.saveRoom('테스트용 방', null, '#test');
      // throw new Error('Room not found');
    }
  }

  private async isValidParticipant(socketId: string): Promise<void> {
    const participant = await this.participantRepository.findParticipantBySocketId(socketId);
    if (!participant) {
      throw new Error('participant not found');
    }
  }

  /**
   * 선택한 방에 입장가능여부 체크
   * @param checkAccessRequestDto.password 사용자 입력 패스워드
   * @param checkAccessRequestDto.roomId 들어가려는 방 ID
   */
  async checkAccess(checkAccessRequestDto: CheckAccessRequestDto) {
    const { password, roomId } = checkAccessRequestDto;
    const studyRoom = await this.roomRepository.findRoomById(roomId);
    const roomParticipants = await this.participantRepository.findParticipantsByRoomId(roomId);

    // 공부방 존재 여부 체크
    if (!studyRoom) {
      throw new NotFoundException('No such study room');
    }

    if (roomParticipants.length === this.maxParticipant) {
      throw new ForbiddenException('Room is already full');
    }

    // 비밀번호 체크
    if (studyRoom.password && !(await this.comparePasswords(password, studyRoom.password))) {
      throw new UnauthorizedException('Passwords do not match');
    }

    return true;
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.roomRepository.deleteRoomById(parseInt(roomId, 10));
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
