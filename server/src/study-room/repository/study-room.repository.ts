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
  async createRoom(roomName: string, categoryId: number): Promise<StudyRoom> {
    const newRoom = this.repository.create({
      room_name: roomName,
      category_id: categoryId,
    });

    return await this.repository.save(newRoom);
  }

  // 특정 방 조회
  findRoom(roomId: number): Promise<StudyRoom | undefined> {
    return this.repository.findOne({ where: { room_id: roomId } });
  }
}
