import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoom } from '../entity/study-room.entity';

@Injectable()
export class StudyRoomRepository {
  constructor(
    @InjectRepository(StudyRoom)
    private readonly repository: Repository<StudyRoom>,
  ) {}

  // 방 생성
  async createRoom(roomName: string, password: string, categoryName: string): Promise<StudyRoom> {
    const newRoom = this.repository.create({
      room_name: roomName,
      password: password,
      category_name: categoryName,
    });

    return await this.repository.save(newRoom);
  }

  // 방 조회
  async getRooms(): Promise<StudyRoom[]> {
    return this.repository.find();
  }

  // 특정 방 조회
  findRoom(roomId: number): Promise<StudyRoom | null> {
    return this.repository.findOne({ where: { room_id: roomId } });
  }
}
