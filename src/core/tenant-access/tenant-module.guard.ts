import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { MODULE_ACCESS_KEY } from 'src/common/decorators/module-access.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModulesTenant } from 'src/core/tenant/entities/modules-tenants.entity';
import { Module } from 'src/core/tenant/entities/modules.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class TenantModuleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,

    @InjectRepository(ModulesTenant, 'management')
    private readonly modulesTenantRepo: Repository<ModulesTenant>,

    @InjectRepository(Module, 'management')
    private readonly moduleRepo: Repository<Module>,

    @InjectRepository(Tenant, 'management')
    private readonly tenantRepo: Repository<Tenant>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verificar si el endpoint requiere validación de módulo
    const moduleCode =
      this.reflector.get<string>(MODULE_ACCESS_KEY, context.getHandler()) ??
      this.reflector.get<string>(MODULE_ACCESS_KEY, context.getClass());

    if (!moduleCode) return true;

    // 2. Extraer y validar el JWT
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado', error);
    }

    request.user = {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    const tenantId = payload.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('No se pudo determinar el tenant.');
    }

    const module = await this.moduleRepo.findOne({
      where: { code: moduleCode, isActive: true },
    });

    if (!module) {
      throw new ForbiddenException(
        `El módulo ${moduleCode} no existe o está inactivo.`,
      );
    }

    const tenant = await this.tenantRepo.findOne({
      where: { code: tenantId, is_active: true },
    });

    if (!tenant) {
      throw new ForbiddenException(`El tenant ${tenantId} no existe.`);
    }

    const tenantModule = await this.modulesTenantRepo.findOne({
      where: {
        tenant: { id: tenant.id },
        module: { id: module.id },
        is_active: true,
      },
    });

    if (!tenantModule) {
      throw new ForbiddenException(
        `El tenant no tiene acceso al módulo ${moduleCode}.`,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
