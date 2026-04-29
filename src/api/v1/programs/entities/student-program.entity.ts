import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('student_program')
export class StudentProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'student_id',
    type: 'uuid'
  })
  student_id: string;

  @Column({
    name: 'program_level_id',
    type: 'uuid'
  })
  program_level_id: string;

  @Column()
  academic_period: string;

  @Column({ name: 'date_registration', type: 'timestamp' })
  date_registration: Date;

  @Column()
  observations: string;

  @Column({ name: 'created_by' })
  created_by: string;

  @Column()
  status: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}