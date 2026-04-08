import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { createTenantRepositoryProviders } from '../../../core/tenant/tenant-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [
    RolesService,
    ...createTenantRepositoryProviders([Role, Permission]),
  ],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
