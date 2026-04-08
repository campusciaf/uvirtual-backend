import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CaslModule } from './auth/casl/casl.module';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    CaslModule,
    PermissionModule,
    AuthModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiV1Module {}
