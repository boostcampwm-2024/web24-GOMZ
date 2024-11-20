import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('study_room_participant')
export class StudyRoomParticipant {
  @PrimaryColumn({ type: 'varchar', length: 45 })
  socket_id: string;

  @Column({ type: 'int', nullable: false })
  room_id: number;
}
