import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'program_level_id', type: 'uuid' })
  program_level_id: string;

  @Column({ name: 'catalog_id', type: 'uuid', nullable: true })
  catalog_id: string | null;

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

  @Column({ name: 'modality', type: 'enum', enum: ['PRESENTIAL', 'VIRTUAL', 'MIXED'] })
  modality: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}