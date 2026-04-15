import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { TenantConnectionPool } from 'src/core/tenant/context/tenant-context';
import { LoginAttempt } from './entities/login-attempt.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptsRepo: Repository<LoginAttempt>,
    private readonly tenantConnectionPool: TenantConnectionPool,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string, tenantId: string) {
    console.log(tenantId);
    const attempt = await this.loginAttemptsRepo.findOne({ where: { email } });

    if (attempt?.blockedUntil) {
      const now = new Date();
      const blockedUntil = attempt.blockedUntil;
      const diffMs = blockedUntil.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes > 15) {
        throw new UnauthorizedException(
          'Cuenta bloqueada temporalmente. Intenta más tarde.'
        );
      } else {
        attempt.blockedUntil = null;
        attempt.attempts = 0;
        await this.loginAttemptsRepo.save(attempt);
      }
    }

    const user = await this.validateUser(email, password);

    if (!user) {
      const now = new Date();
      if (!attempt) {
        await this.loginAttemptsRepo.save({ email, attempts: 1 });
      } else {
        attempt.attempts += 1;
        if (attempt.attempts >= 5) {
          attempt.blockedUntil = new Date(now.getTime() + 15 * 60 * 1000);
        } else {
          attempt.blockedUntil = null;
        }
        await this.loginAttemptsRepo.save(attempt);
      }

      throw new UnauthorizedException('Credenciales inválidas');
    }

    const connection = await this.tenantConnectionPool.getConnection(tenantId);
    const userRepo = connection.getRepository(User);
    const tenantUser = await userRepo.findOne({ where: { email } });

    if (!tenantUser) {
      throw new UnauthorizedException('Usuario no autorizado para este tenant');
    }

    if (attempt) {
      attempt.attempts = 0;
      attempt.blockedUntil = null;
      await this.loginAttemptsRepo.save(attempt);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: tenantId,
      firstName: user.firstName,
      secondName: user.secondName,
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname,
    };

    const allPermissions = user.roles
      .flatMap((role) => role.permissions)
      .filter(
        (perm, index, self) =>
          index === self.findIndex((p) => p.action === perm.action)
      )
      .map((perm) => {
        return {
          action: perm.action,
          subject: perm.subject,
        };
      });

    const data = {
      id: user.id,
      firstName: user.firstName,
      secondName: user.secondName,
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname,
      email: user.email,
      phone: user.phone,
      documentId: user.documentId,
      isActive: user.isActive,
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
      })),
      permissions: allPermissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: data,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' }
    );

    // TODO: Implementar envío de email
    return { message: 'Token de restablecimiento generado', token };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(user.data.id, {
        password: hashedPassword,
      });

      return { message: 'Contraseña restablecida con éxito' };
    } catch (error) {
      throw new UnauthorizedException(
        'Token inválido o expirado',
        error.message
      );
    }
  }
}
