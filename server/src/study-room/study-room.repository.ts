import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyRoom } from './study-room.entity';

@Injectable()
export class StudyRoomRepository {
  constructor(
    @InjectRepository(StudyRoom)
    private readonly repository: Repository<StudyRoom>,
  ) {}

  // 방 생성
  createRoom(roomName: string, categoryId: number): StudyRoom {
    const newRoom = this.repository.create({
      room_name: roomName,
      category_id: categoryId,
    });
    this.repository.save(newRoom);

    return newRoom;
  }

  // 특정 방 조회
  async findRoom(roomId: number): Promise<StudyRoom | undefined> {
    return await this.repository.findOne({ where: { room_id: roomId } });
  }
}
