import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column()
  mime_type: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  alt_text: string;

  @Column({ nullable: true })
  caption: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  folder: string;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ nullable: true })
  uploaded_by_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
