import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTenancyMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    try {
      const token = authHeader.split(' ')[1];
      const payload: any = this.jwtService.decode(token);

      if (payload?.tenantId) {
        const rawHeaderTenantId = req.headers['x-tenant-id'];

        // Normalizar header a string
        const headerTenantId = Array.isArray(rawHeaderTenantId)
          ? rawHeaderTenantId[0]
          : rawHeaderTenantId;

        const payloadTenantId = String(payload.tenantId).toUpperCase();
        const headerTenantIdUpper = headerTenantId
          ? String(headerTenantId).toUpperCase()
          : undefined;
        if (headerTenantIdUpper && headerTenantIdUpper !== payloadTenantId) {
          return res.status(401).json({
            statusCode: 401,
            message: 'Token no válido para este tenant',
          });
        }

        req.headers['x-tenant-id'] = payload.tenantId;
      }
    } catch (error) {
      console.error('Error decodificando token en middleware:', error);
    }

    next();
  }
}
