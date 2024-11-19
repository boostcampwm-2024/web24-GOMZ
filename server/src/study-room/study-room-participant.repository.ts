import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoomParticipant } from './study-room-participant.entity';

@Injectable()
export class StudyRoomParticipantRepository {
  constructor(
    @InjectRepository(StudyRoomParticipant)
    private readonly repository: Repository<StudyRoomParticipant>,
  ) {}

  // 방에 사용자 추가
  async addUserToRoom(roomId: number, socketId: string, nickname: string): Promise<void> {
    // 이건 서비스 로직의 영역
    // const room = await this.findRoom(roomId);
    // if (!room) {
    //   throw new Error('Room not found');
    // }

    const participant = this.repository.create({
      socket_id: socketId,
      nickname: nickname,
      room_id: roomId,
    });

    await this.repository.save(participant);
  }

  // 방에서 사용자 제거
  async removeUserFromRoom(roomId: number, socketId: string): Promise<void> {
    const participant = await this.repository.findOne({
      where: { socket_id: socketId, room_id: roomId },
    });

    if (!participant) {
      throw new Error('Participant not found in the room');
    }

    await this.repository.remove(participant);
  }

  // 특정 방의 모든 사용자 조회
  async getRoomUsers(roomId: number): Promise<{ socketId: string; nickname: string }[]> {
    const participants = await this.repository.find({
      where: { room_id: roomId },
    });

    return participants.map((participant) => ({
      socketId: participant.socket_id,
      nickname: participant.nickname,
    }));
  }

  // 모든 방에서 특정 사용자 제거
  async leaveAllRooms(socketId: string): Promise<void> {
    const participants = await this.repository.find({
      where: { socket_id: socketId },
    });

    if (participants.length === 0) {
      throw new Error('Participant not found in any room');
    }

    await this.repository.remove(participants);
  }

  // 모든 방 정보 조회
  async getAllRooms(): Promise<Record<string, { socketId: string; nickname: string }[]>> {
    const participants = await this.repository.find();
    const rooms: Record<string, { socketId: string; nickname: string }[]> = {};

    participants.forEach((participant) => {
      if (!rooms[participant.room_id]) {
        rooms[participant.room_id] = [];
      }

      rooms[participant.room_id].push({
        socketId: participant.socket_id,
        nickname: participant.nickname,
      });
    });

    return rooms;
  }
}
