import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const permissions = dto.permissionIds?.length
      ? await this.permissionsRepository.findByIds(dto.permissionIds)
      : [];
    if (dto.permissionIds && permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException('Some permissions not found');
    }
    const lastRoles = await this.roleRepository.find({
      order: { order: 'DESC' },
      take: 1,
    });
    const lastRole = lastRoles[0];
    const newOrder = lastRole ? (lastRole.order ?? 0) + 1 : 1;
    const role = this.roleRepository.create({
      name: dto.name,
      isSystem: false,
      order: newOrder,
      permissions,
    });
    return this.roleRepository.save(role);
  }

  async findOne(id: string): Promise<{
    data: Role;
    message: string;
    success: boolean;
  }> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      return {
        data: null as any,
        message: 'Role not found',
        success: false,
      };
    }
    return {
      data: role,
      message: 'Role charge',
      success: true,
    };
  }

  async findAll(): Promise<{
    data: Role[];
    message: string;
    success: boolean;
  }> {
    const data = await this.roleRepository.find({
      relations: ['permissions'],
    });
    return {
      data,
      message: 'Roles cargados correctamente',
      success: true,
    };
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (dto.name) role.data.name = dto.name;
    if (dto.permissionIds) {
      const permissions = await this.permissionsRepository.findByIds(
        dto.permissionIds
      );
      if (permissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('Some permissions not found');
      }
      role.data.permissions = permissions;
    }
    return this.roleRepository.save(role.data);
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Role> {
    const role = await this.findOne(id);
    role.data.isActive = isActive;
    return this.roleRepository.save(role.data);
  }

  async addPermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    if (!role.data.permissions.some((p) => p.id === permission.id)) {
      role.data.permissions.push(permission);
    }
    return this.roleRepository.save(role.data);
  }

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findOne(roleId);
    role.data.permissions = role.data.permissions.filter(
      (p) => p.id !== permissionId
    );
    return this.roleRepository.save(role.data);
  }
}
