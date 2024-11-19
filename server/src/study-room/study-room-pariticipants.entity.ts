import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StudyRoom } from './study-room.entity';

@Entity('study_room_participant')
export class StudyRoomParticipant {
  @PrimaryColumn({ type: 'varchar', length: 45 })
  socket_id: string;

  @Column({ type: 'varchar', length: 45 })
  nickname: string;

  @Column({ type: 'int', nullable: false })
  room_id: number;

  @ManyToOne(() => StudyRoom, (studyRoom) => studyRoom.room_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  studyRoom: StudyRoom;
}
