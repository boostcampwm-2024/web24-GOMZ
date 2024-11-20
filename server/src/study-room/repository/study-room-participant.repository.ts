import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoomParticipant } from '../entity/study-room-participant.entity';

@Injectable()
export class StudyRoomParticipantRepository {
  constructor(
    @InjectRepository(StudyRoomParticipant)
    private readonly repository: Repository<StudyRoomParticipant>,
  ) {}

  // 방에 사용자 추가
  async addUserToRoom(roomId: number, socketId: string): Promise<void> {
    const participant = this.repository.create({
      socket_id: socketId,
      room_id: roomId,
    });

    await this.repository.save(participant);
  }

  // 특정 사용자 조회
  async findParticipant(socketId: string): Promise<StudyRoomParticipant | null> {
    return this.repository.findOne({ where: { socket_id: socketId } });
  }

  // 방에서 사용자 제거
  async removeUserFromRoom(roomId: number, socketId: string): Promise<void> {
    const participant = await this.repository.findOne({
      where: { socket_id: socketId, room_id: roomId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in the room');
    }

    await this.repository.remove(participant);
  }

  // 특정 방의 모든 사용자 조회
  async getRoomUsers(roomId: number): Promise<{ socketId: string }[]> {
    const participants = await this.repository.find({
      where: { room_id: roomId },
    });

    return participants.map((participant) => ({
      socketId: participant.socket_id,
    }));
  }

  // 모든 방에서 특정 사용자 제거
  async leaveAllRooms(socketId: string): Promise<void> {
    const participants = await this.repository.find({
      where: { socket_id: socketId },
    });

    if (participants.length > 0) {
      await this.repository.remove(participants);
    }
  }

  // 모든 방 정보 조회
  async getAllRooms(): Promise<Record<string, { socketId: string }[]>> {
    const participants = await this.repository.find();
    const rooms: Record<string, { socketId: string }[]> = {};

    for (const participant of participants) {
      if (!rooms[participant.room_id]) {
        rooms[participant.room_id] = [];
      }

      rooms[participant.room_id].push({
        socketId: participant.socket_id,
      });
    }

    return rooms;
  }
}
