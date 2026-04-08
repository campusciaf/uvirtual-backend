import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_TENANT } from '../decorators/skip-tenant.decorator';

@Injectable()
export class SkipTenantGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    request.__skipTenant = skipTenant ?? false;

    return true;
  }
}
