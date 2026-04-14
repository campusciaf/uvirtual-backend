import { config } from 'dotenv';
config();

import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

import { Tenant } from '../core/tenant/entities/tenant.entity';
import { ModulesTenant } from '../core/tenant/entities/modules-tenants.entity';
import { Permission } from '../api/v1/roles/entities/permission.entity';

import seedPermissions from './seeders/permissions.seeder';

const args = process.argv.slice(2);

const createManagementDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [Tenant, ModulesTenant],
    synchronize: false,
  });
};

const createTenantDataSource = (tenant: Tenant) => {
  return new DataSource({
    type: 'postgres',
    host: tenant.database_host,
    port: tenant.database_port,
    username: tenant.database_username,
    password: tenant.database_password,
    database: tenant.database_name,
    schema: tenant.database_schema_name || 'public',
    entities: [Permission],
    synchronize: false,
    extra: {
      options: '-c timezone=America/Bogota',
    },
  });
};

const runModuleSeeder = async (
  dataSource: DataSource,
  modulePath: string,
): Promise<void> => {
  const seederPath = path.join(__dirname, 'seeders', `${modulePath}.seeder.js`);

  if (!fs.existsSync(seederPath)) {
    return;
  }

  try {
    const seeder = await import(seederPath);
    if (seeder.default) {
      await seeder.default(dataSource);
    }
  } catch (error) {
    console.error(`  ✗ Error en seeder de ${modulePath}:`, error);
  }
};

(async () => {
  const configService = new ConfigService();
  const managementDataSource = createManagementDataSource(configService);

  await managementDataSource.initialize();
  console.log('[Seeder] Conectado a la base de datos de management');

  const tenantRepository = managementDataSource.getRepository(Tenant);
  const tenants = await tenantRepository.find({ where: { is_active: true } });
  console.log(`[Seeder] Encontrados ${tenants.length} tenants activos`);

  for (const tenant of tenants) {
    console.log(
      `[Seeder] Procesando tenant: ${tenant.code} (${tenant.database_name})`,
    );
    const tenantDataSource = createTenantDataSource(tenant);
    await tenantDataSource.initialize();
    console.log(`[Seeder] Conectado a DB del tenant ${tenant.code}`);

    try {
      if (
        args.includes('permissions') ||
        (!args.includes('departments') && !args.includes('municipalities'))
      ) {
        console.log('[Seeder] Ejecutando seed de permisos por módulos...');
        await seedPermissions(tenantDataSource);
      }
    } catch (error) {
      console.error(`[Seeder] Error en tenant ${tenant.code}:`, error);
    } finally {
      await tenantDataSource.destroy();
      console.log(`[Seeder] Desconectado de DB del tenant ${tenant.code}`);
    }
  }

  await managementDataSource.destroy();
  console.log('[Seeder] Finalizado');
})();
