import { Provider, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TenantConnectionPool } from './context/tenant-context';

/**
 * Crea un provider REQUEST-SCOPED que inyecta el repositorio del tenant correcto
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function createTenantRepositoryProvider(entity: Function): Provider {
  return {
    provide: getRepositoryToken(entity),
    scope: Scope.REQUEST,
    inject: [TenantConnectionPool, REQUEST],
    useFactory: async (pool: TenantConnectionPool, request: any) => {
      // Obtener tenant del request
      const tenantCode = request.headers['x-tenant-id'];

      if (!tenantCode) {
        throw new Error('Tenant code required');
      }

      const connection = await pool.getConnection(tenantCode);

      return connection.getRepository(entity);
    },
  };
}

/**
 * Helper para crear múltiples providers de una vez
 */
export function createTenantRepositoryProviders(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  entities: Function[]
): Provider[] {
  return entities.map((entity) => createTenantRepositoryProvider(entity));
}
