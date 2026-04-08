import { Injectable, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantConnectionPool implements OnModuleDestroy {
  private readonly logger = new Logger(TenantConnectionPool.name);
  private connections = new Map<string, DataSource>();
  private entitiesPath: string;

  constructor(
    @InjectDataSource('management')
    private adminConnection: DataSource,
    @Inject('TENANT_ENTITIES_PATH')
    entitiesPath: string
  ) {
    this.entitiesPath = entitiesPath;
  }

  async getConnection(tenantCode: string): Promise<DataSource> {
    if (this.connections.has(tenantCode)) {
      const conn = this.connections.get(tenantCode)!;
      if (conn.isInitialized) return conn;
    }

    const tenant = await this.adminConnection
      .getRepository(Tenant)
      .findOne({ where: { code: tenantCode, is_active: true } });

    if (!tenant) {
      throw new Error(`Tenant ${tenantCode} not found`);
    }

    const options: DataSourceOptions = {
      type: 'postgres',
      host: tenant.database_host,
      port: tenant.database_port,
      username: tenant.database_username,
      password: tenant.database_password,
      database: tenant.database_name,
      schema: tenant.database_schema_name || 'public',
      entities: [__dirname + '/../../../api/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
      extra: {
        options: '-c timezone=America/Bogota',
      },
    };

    this.logger.log(
      `Creating connection for tenant ${tenantCode} with entities path: ${this.entitiesPath}`
    );

    const ds = new DataSource(options);
    await ds.initialize();

    this.logger.log(
      `Tenant ${tenantCode} loaded entities: ${ds.entityMetadatas.map((m) => m.name).join(', ')}`
    );

    this.connections.set(tenantCode, ds);
    this.logger.log(`Tenant ${tenantCode} connection initialized`);

    return ds;
  }

  async onModuleDestroy() {
    for (const [code, ds] of this.connections) {
      if (ds.isInitialized) {
        await ds.destroy();
        this.logger.log(`Tenant ${code} connection closed`);
      }
    }
  }
}
