import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('prerequisite_courses')
export class PrerequisiteCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ name: 'prerequisite_id', type: 'uuid' })
  prerequisite_id: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}