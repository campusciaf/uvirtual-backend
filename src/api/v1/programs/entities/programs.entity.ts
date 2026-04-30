import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('programs')
export class Programs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'area_knowledge', type: 'varchar' })
  area_knowledge: string;

  @Column({ name: 'modality', type: 'enum', enum: ['PRESENTIAL', 'VIRTUAL', 'MIXED'] })
  modality: string;

  // @Column({ name: 'methodology', type: 'varchar' })
  // methodology: string;

  @Column({ name: 'titration_type', type: 'enum', enum: ['PROPEDEUTIC', 'SINGLE_CYCLE'] })
  titration_type: string;

  @Column({ name: 'state', type: 'boolean' })
  state: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}