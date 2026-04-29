import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('programs_level')
export class ProgramsLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'program_id', type: 'uuid' })
  program_id: string;

  @Column({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'order', type: 'int' })
  order: number;

  @Column({ name: 'awarded_degree', type: 'varchar' })
  awarded_degree: string;

  @Column({ name: 'duration_semesters', type: 'int' })
  duration_semesters: number;

  @Column({ name: 'total_credits', type: 'int' })
  total_credits: number;

  @Column({ name: 'status', type: 'boolean' })
  status: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}