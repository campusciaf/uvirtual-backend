import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Module } from './modules.entity';
import { Tenant } from './tenant.entity';

@Entity('modules_tenants')
export class ModulesTenant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Module, (module) => module.modulesTenants, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_module' })
  module: Module;

  @ManyToOne(() => Tenant, (tenant) => tenant.modulesTenants, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_tenant' })
  tenant: Tenant;

  @Column({ nullable: true })
  grantedBy: number;

  @Column({ nullable: true })
  granted_reason: string;

  @Column({ nullable: true })
  disabled_reason: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
