import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ToggleRoleDto } from './dto/toggle-role.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/update')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/toggle')
  toggle(@Param('id') id: string, @Body() dto: ToggleRoleDto) {
    return this.rolesService.toggleStatus(id, dto.isActive);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/permissions/:permissionId/add')
  addPermission(
    @Param('id') id: string,
    @Param('permissionId') pid: string,
  ) {
    return this.rolesService.addPermission(id, pid);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/permissions/:permissionId/remove')
  removePermission(
    @Param('id') id: string,
    @Param('permissionId') pid: string,
  ) {
    return this.rolesService.removePermission(id, pid);
  }
}
