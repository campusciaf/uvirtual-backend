import { Global, Module, Scope, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { TenancyService } from './tenancy.service';
import { Tenant } from './entities/tenant.entity';
import { TenantConnectionPool } from './context/tenant-context';
import { Module as ModuleClass } from './entities/modules.entity';
import { ModulesTenant } from './entities/modules-tenants.entity';

const CONNECTION_PROVIDER = {
  provide: DataSource,
  scope: Scope.REQUEST,
  useFactory: async (request: Request, tenancyService: TenancyService) => {
    const skipTenant = request.headers['x-skip-tenant'] === 'true';
    if (skipTenant) {
      return tenancyService['managementDataSource'];
    }

    const tenantCode = request.headers['x-tenant-id'] as string;

    if (!tenantCode) {
      throw new BadRequestException('Header x-tenant-id es requerido');
    }

    return await tenancyService.getTenantConnection(tenantCode);
  },
  inject: [REQUEST, TenancyService],
};

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Tenant,
        ModuleClass,
        ModulesTenant,
      ],
      'management'
    ),
  ],
  controllers: [],
  providers: [
    TenancyService,
    CONNECTION_PROVIDER,
    TenantConnectionPool,
    {
      provide: 'TENANT_ENTITIES_PATH',
      useValue: __dirname + '/../../api/**/*.entity{.ts,.js}',
    },
  ],
  exports: [
    DataSource,
    TenancyService,
    TenantConnectionPool,
  ],
})
export class TenancyModule {}
