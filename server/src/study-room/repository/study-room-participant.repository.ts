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

  async saveParticipant(roomId: number, socketId: string): Promise<void> {
    const participant = this.repository.create({
      socket_id: socketId,
      room_id: roomId,
    });

    await this.repository.save(participant);
  }

  async findParticipantBySocketId(socketId: string): Promise<StudyRoomParticipant | null> {
    return this.repository.findOne({ where: { socket_id: socketId } });
  }

  async findParticipantsByRoomId(roomId: number): Promise<{ socketId: string }[]> {
    const participants = await this.repository.find({
      where: { room_id: roomId },
    });

    return participants.map((participant) => ({
      socketId: participant.socket_id,
    }));
  }

  async findRoomIdBySocketId(socketId: string): Promise<number | null> {
    const participant = await this.repository.findOne({
      where: { socket_id: socketId },
    });

    return participant.room_id;
  }

  async deleteParticipantBySocketId(roomId: number, socketId: string): Promise<void> {
    const participant = await this.repository.findOne({
      where: { socket_id: socketId, room_id: roomId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in the room');
    }

    await this.repository.remove(participant);
  }
}
