import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/api/v1/roles/entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<{
    data: Permission[];
    message: string;
    success: boolean;
  }> {
    const data = await this.permissionsRepository.find();

    return {
      data,
      message: 'Permisos cargados correctamente',
      success: true,
    };
  }
}
