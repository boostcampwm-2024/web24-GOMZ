import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' }) // default: increment
  id: number;

  @Column({ name: 'category_name', length: 45 })
  name: string;

  // study room 연결 (1-1)
}
