import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenancyService implements OnModuleDestroy {
  private readonly connectionMap: Map<string, DataSource> = new Map();
  private readonly initPromises: Map<string, Promise<DataSource>> = new Map();

  constructor(
    @InjectDataSource('management')
    private readonly managementDataSource: DataSource
  ) { }

  async getTenantConnection(tenantCode: string): Promise<DataSource> {
    if (this.connectionMap.has(tenantCode)) {
      const connection = this.connectionMap.get(tenantCode)!;
      if (connection.isInitialized) return connection;
    }

    if (this.initPromises.has(tenantCode)) {
      return this.initPromises.get(tenantCode)!;
    }

    const initPromise = (async () => {
      const tenantRepo = this.managementDataSource.getRepository(Tenant);
      const tenant = await tenantRepo.findOne({ where: { code: tenantCode } });

      if (!tenant) {
        this.initPromises.delete(tenantCode);
        throw new Error(`Tenant '${tenantCode}' no encontrado.`);
      }

      const dataSource = new DataSource({
        type: 'postgres',
        host: tenant.database_host,
        port: tenant.database_port,
        username: tenant.database_username,
        password: tenant.database_password,
        database: tenant.database_name,
        entities: [__dirname + '/../../api/**/*.entity{.ts,.js}'],
        synchronize: true,
        extra: {
          options: '-c timezone=America/Bogota',
        },
      });

      await dataSource.initialize();

      this.connectionMap.set(tenantCode, dataSource);
      this.initPromises.delete(tenantCode);

      return dataSource;
    })();

    this.initPromises.set(tenantCode, initPromise);
    return initPromise;
  }

  async onModuleDestroy() {
    for (const connection of this.connectionMap.values()) {
      await connection.destroy();
    }
  }
}
