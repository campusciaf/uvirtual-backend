import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: 'permissions',
  version: '1',
})
export class PermissionController {
  constructor(private readonly permissionsService: PermissionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }
}
