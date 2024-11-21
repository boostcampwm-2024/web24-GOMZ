import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('study_room')
export class StudyRoom {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  room_name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'varchar', nullable: false })
  category_name: string;

  @BeforeInsert()
  setCreatedAt() {
    this.created_at = new Date();
  }

  @Column({ type: 'varchar', length: 45, nullable: true })
  password: string;
}
