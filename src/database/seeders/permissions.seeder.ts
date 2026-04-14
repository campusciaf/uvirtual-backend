import { DataSource } from 'typeorm';
import { Permission } from '../../api/v1/roles/entities/permission.entity';
import { PERMISSIONS } from '../constants';

export default async function seedPermissions(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);

  for (const perm of PERMISSIONS) {
    const existing = await permissionRepo.findOne({
      where: { action: perm.action },
    });

    if (existing) {
      if (existing.subject !== perm.subject) {
        existing.subject = perm.subject;
        await permissionRepo.save(existing);
        console.log(`  ✓ Permiso ${perm.action} actualizado`);
      } else {
        console.log(`  ✓ Permiso ${perm.action} sin cambios`);
      }
      continue;
    }

    const permissionEntity = permissionRepo.create(perm);
    await permissionRepo.save(permissionEntity);
    console.log(`  ✓ Permiso ${perm.action} creado`);
  }
}
