import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { StudyRoom } from '../entity/study-room.entity';

export class RoomInfoResponseDto {
  constructor(room: StudyRoom, roomId: number, curParticipant: number, maxParticipant: number) {
    this.roomId = roomId;
    this.roomName = room.room_name;
    this.categoryName = room.category_name;
    this.isPrivate = !!room.password;
    this.curParticipant = curParticipant;
    this.maxParticipant = maxParticipant;
  }

  @IsNumber()
  roomId: number;

  @IsString()
  roomName: string;

  @IsString()
  categoryName: string;

  @IsBoolean()
  isPrivate: boolean;

  @IsNumber()
  curParticipant: number;

  @IsNumber()
  maxParticipant: number;
}
