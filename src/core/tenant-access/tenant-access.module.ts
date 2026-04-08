import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModuleGuard } from './tenant-module.guard';
import { ModulesTenant } from 'src/core/tenant/entities/modules-tenants.entity';
import { Module as TenantModule } from 'src/core/tenant/entities/modules.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ModulesTenant, TenantModule, Tenant],
      'management',
    ),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantModuleGuard,
    },
  ],
  exports: [TypeOrmModule],
})
export class TenantAccessModule { }
