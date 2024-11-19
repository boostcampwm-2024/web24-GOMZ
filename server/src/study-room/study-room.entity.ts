import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert } from 'typeorm';

@Entity('study_room')
export class StudyRoom {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  room_name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'int', nullable: false })
  category_id: number;

  @BeforeInsert()
  setCreatedAt() {
    this.created_at = new Date();
  }
}
