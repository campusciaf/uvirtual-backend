import { config } from 'dotenv';
config();

import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { Tenant } from '../core/tenant/entities/tenant.entity';
import { ModulesTenant } from '../core/tenant/entities/modules-tenants.entity';
import { Permission } from '../api/v1/roles/entities/permission.entity';
import { Module as TenancyModuleClass } from '../core/tenant/entities/modules.entity';
import seedPermissions from './seeders/permissions.seeder';

const args = process.argv.slice(2);

const extractTenantFlag = (args: string[]): string | null => {
  const tenantArg = args.find((a) => a.startsWith('--tenant='));
  return tenantArg ? tenantArg.split('=')[1] : null;
};

const createManagementDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [Tenant, TenancyModuleClass, ModulesTenant],
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

(async () => {
  const targetTenantCode = extractTenantFlag(args);

  if (!targetTenantCode) {
    console.error(
      '[Seeder] ERROR: Debes proveer un tenant via el flag --tenant=CODIGO_TENANT',
    );
    console.error(
      '[Seeder] Ejemplo: npm run seed:tenant -- --tenant=UVIRTUAL_01 permissions',
    );
    process.exit(1);
  }

  const configService = new ConfigService();
  const managementDataSource = createManagementDataSource(configService);

  await managementDataSource.initialize();
  console.log('[Seeder] Conectado a la base de datos de management principal');

  const tenantRepository = managementDataSource.getRepository(Tenant);
  const tenant = await tenantRepository.findOne({
    where: { code: targetTenantCode, is_active: true },
  });

  if (!tenant) {
    console.error(
      `[Seeder] ERROR: No se encontró un tenant activo con el código provisto: ${targetTenantCode}`,
    );
    await managementDataSource.destroy();
    process.exit(1);
  }

  console.log(
    `[Seeder] Iniciando seed para el tenant específico: ${tenant.code} (${tenant.database_name})`,
  );
  const tenantDataSource = createTenantDataSource(tenant);
  await tenantDataSource.initialize();
  console.log(
    `[Seeder] Conectado exitosamente a la DB del tenant ${tenant.code}`,
  );

  try {
    if (
      args.includes('permissions') ||
      (!args.includes('departments') && !args.includes('municipalities'))
    ) {
      console.log('[Seeder] Ejecutando seed de permisos...');
      await seedPermissions(tenantDataSource);
    }
  } catch (error) {
    console.error(
      `[Seeder] Error corriendo seeders en tenant ${tenant.code}:`,
      error,
    );
  } finally {
    await tenantDataSource.destroy();
    console.log(`[Seeder] Desconectado de la DB del tenant ${tenant.code}`);
  }

  await managementDataSource.destroy();
  console.log('[Seeder] Proceso finalizado.');
})();
