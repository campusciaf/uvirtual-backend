import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ModulesTenant } from './modules-tenants.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  database_host: string;

  @Column()
  database_port: number;

  @Column()
  database_name: string;

  @Column()
  database_schema_name: string;

  @Column()
  database_username: string;

  @Column()
  database_password: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  company_name: string;

  @OneToMany(() => ModulesTenant, (mt) => mt.tenant)
  modulesTenants: ModulesTenant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
