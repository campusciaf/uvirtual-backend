import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('student_program_history')
export class StudentProgramHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_id: string;

  @Column()
  program_id: string;

  @Column()
  academic_period: string;

  @Column()
  registration_date: Date;

  @Column()
  end_date: Date;

  @Column()
  status: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}