import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CaslModule } from './auth/casl/casl.module';
import { PermissionModule } from './permission/permission.module';
import { ProgramsModule } from './programs/programs.module';
import { CoursesModule } from './courses/courses.module';
import { CommonModule } from './common/common.module';
import { VoltAgentModule } from './voltagent/voltagent.module';

@Module({
  imports: [
    CommonModule,
    VoltAgentModule,
    CaslModule,
    PermissionModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProgramsModule,
    CoursesModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiV1Module { }