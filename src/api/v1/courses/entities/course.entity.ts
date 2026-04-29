import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'program_level_id', type: 'uuid' })
  program_level_id: string;

  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'image_url', type: 'varchar' })
  image_url: string;

  @Column({ name: 'credits', type: 'int' })
  credits: number;

  @Column({ name: 'total_hours', type: 'int' })
  total_hours: number;

  @Column({ name: 'type', type: 'enum', enum: ['OBLIGATORY', 'ELECTIVE'] })
  type: string;

  @Column({ name: 'order', type: 'int' })
  order: number;

  @Column({ name: 'semester', type: 'int' })
  semester: number;

  @Column({ name: 'status', type: 'boolean' })
  status: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}