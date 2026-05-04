import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('courses_catalog')
export class CourseCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  image_url: string;

  @Column({ name: 'credits', type: 'int' })
  credits: number;

  @Column({ name: 'total_hours', type: 'int' })
  total_hours: number;

  @Column({ name: 'type', type: 'enum', enum: ['OBLIGATORY', 'ELECTIVE'] })
  type: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}