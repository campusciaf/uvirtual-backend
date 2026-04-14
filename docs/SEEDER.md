# Sistema de Seeding de Permisos

Este documento describe el sistema de seeding de permisos para **uvirtual-backend**, basado en la arquitectura multi-tenant del proyecto.

---

## Arquitectura General

El sistema de seeding está diseñado para funcionar en un entorno **multi-tenant**, donde cada tenant tiene su propia base de datos. Los seeders se ejecutan conectándose directamente a la base de datos de cada tenant.

### Estructura de Archivos

```
src/database/
├── constants.ts              # Definición de permisos base
├── seeder.ts                 # Seedea TODOS los tenants activos
├── seed-tenant.ts            # Seedea un tenant específico
└── seeders/
    └── permissions.seeder.ts # Seeder de permisos
```

---

## Comandos Disponibles

### 1. Seed todos los tenants activos

```bash
npm run seed
```

Ejecuta el seeder de permisos en **todos** los tenants que estén activos en la base de datos de management.

### 2. Seed un tenant específico

```bash
npm run seed:tenant -- --tenant=CODIGO_TENANT
```

Ejemplo:
```bash
npm run seed:tenant -- --tenant=UVIRTUAL_01
```

---

## Permisos Base (v1)

### Módulo: Users
| Action | Descripción |
|--------|-------------|
| `users.create` | Permite registrar un nuevo usuario dentro del ecosistema digital. |
| `users.read` | Accede a la información de usuarios activos o históricos en el sistema. |
| `users.update` | Faculta la modificación de datos o roles asignados a un usuario. |
| `users.delete` | Otorga la capacidad de eliminar un usuario y su rastro digital. |

### Módulo: Roles
| Action | Descripción |
|--------|-------------|
| `roles.create` | Crea un nuevo rol para definir jerarquías y permisos específicos. |
| `roles.read` | Consulta los roles existentes y sus permisos asociados. |
| `roles.update` | Permite modificar los permisos o atributos de un rol existente. |
| `roles.delete` | Elimina un rol del sistema, removiendo sus asociaciones de permisos. |

---

## Cómo Agregar Nuevos Módulos

### Paso 1: Agregar permisos en `constants.ts`

```typescript
export const PERMISSIONS: PermissionDefinition[] = [
  // ... permisos existentes ...
  
  // Nuevos permisos del módulo
  {
    action: 'courses.create',
    subject: 'Permite crear nuevos cursos.',
  },
  {
    action: 'courses.read',
    subject: 'Accede a la información de cursos.',
  },
  // ... más permisos ...
];
```

### Paso 2: Agregar el módulo a la lista

```typescript
export const MODULE_SEEDER_PATHS: string[] = [
  'users',
  'roles',
  'courses',  // Nuevo módulo
];
```

### Paso 3: Crear el seeder del módulo

Crear `src/database/seeders/courses.seeder.ts`:

```typescript
import { DataSource } from 'typeorm';
import { Permission } from '../../api/v1/roles/entities/permission.entity';
import { PERMISSIONS } from '../constants';

export default async function seedCoursesPermissions(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);
  const coursePermissions = PERMISSIONS.filter(p => 
    p.action.startsWith('courses.')
  );

  for (const perm of coursePermissions) {
    const existing = await permissionRepo.findOne({
      where: { action: perm.action },
    });

    if (existing) {
      if (existing.subject !== perm.subject) {
        existing.subject = perm.subject;
        await permissionRepo.save(existing);
        console.log(`  ✓ Permiso ${perm.action} actualizado`);
      }
      continue;
    }

    const permissionEntity = permissionRepo.create(perm);
    await permissionRepo.save(permissionEntity);
    console.log(`  ✓ Permiso ${perm.action} creado`);
  }
}
```

---

## Flujo de Ejecución

```
┌─────────────────────────────────────────┐
│  npm run seed / npm run seed:tenant     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  seeder.ts / seed-tenant.ts             │
│  - Conecta a DB de Management          │
│  - Obtiene tenants activos              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Por cada tenant:                       │
│  - Crea conexión a DB del tenant       │
│  - Ejecuta seeders de permisos         │
│  - Cierra conexión                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  permissions.seeder.ts                 │
│  - Lee permisos de constants.ts        │
│  - Inserta o actualiza en BD           │
└─────────────────────────────────────────┘
```

---

## Notas Importantes

1. **Idempotencia**: Los seeders son idempotentes. Si un permiso ya existe con la misma descripción, no se modifica.

2. **Multi-tenant**: Cada tenant tiene su propia tabla de `permissions` en su base de datos.

3. **Transaccionalidad**: Los seeders se ejecutan por tenant de forma independiente.

4. **Logging**: Los seeders imprimen en consola el progreso y resultado de cada operación.

---

> Documentación actualizada: Abril 2026
