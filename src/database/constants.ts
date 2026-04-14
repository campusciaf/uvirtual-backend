export interface PermissionDefinition {
  action: string;
  subject: string;
}

export const PERMISSIONS: PermissionDefinition[] = [
  {
    action: 'users.create',
    subject:
      'Permite registrar un nuevo usuario dentro del ecosistema digital.',
  },
  {
    action: 'users.read',
    subject:
      'Accede a la información de usuarios activos o históricos en el sistema.',
  },
  {
    action: 'users.update',
    subject:
      'Faculta la modificación de datos o roles asignados a un usuario.',
  },
  {
    action: 'users.delete',
    subject:
      'Otorga la capacidad de eliminar un usuario y su rastro digital.',
  },

  {
    action: 'roles.create',
    subject:
      'Crea un nuevo rol para definir jerarquías y permisos específicos.',
  },
  {
    action: 'roles.read',
    subject: 'Consulta los roles existentes y sus permisos asociados.',
  },
  {
    action: 'roles.update',
    subject:
      'Permite modificar los permisos o atributos de un rol existente.',
  },
  {
    action: 'roles.delete',
    subject:
      'Elimina un rol del sistema, removiendo sus asociaciones de permisos.',
  },
];

export const MODULE_SEEDER_PATHS: string[] = ['users', 'roles'];
