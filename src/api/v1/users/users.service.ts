import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { Role } from 'src/api/v1/roles/entities/role.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Tenant } from 'src/core/tenant/entities/tenant.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';
import { UserRegisterEmail } from 'src/api/v1/email-templates/user-register';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant, 'management')
    private readonly tenantRepository: Repository<Tenant>,
    private readonly mailerService: MailerService,
  ) { }

  async findAll(
    query: UserFilterDto,
    externalRepo?: Repository<User>
  ): Promise<{
    data: User[];
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  }> {
    const repo = externalRepo || this.usersRepository;
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    const qb = repo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.roles', 'roles')
      .select([
        'users.id',
        'users.firstName',
        'users.secondName',
        'users.firstSurname',
        'users.secondSurname',
        'users.email',
        'users.documentId',
        'users.isActive',
        'users.phone',
        'users.createdAt',
        'users.updatedAt',
        'roles.id',
        'roles.name',
      ]);

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      const isNumeric = /^\d+$/.test(searchTerm);
      if (isNumeric) {
        qb.andWhere(
          `(
          users.id = :numericSearch OR
          users."documentId" ILIKE :search OR
          users.phone ILIKE :search
        )`,
          {
            numericSearch: parseInt(searchTerm),
            search: `%${searchTerm}%`,
          }
        );
      } else {
        qb.andWhere(
          `(
          users.email ILIKE :search OR
          users."firstName" ILIKE :search OR
          COALESCE(users."secondName", '') ILIKE :search OR
          users."firstSurname" ILIKE :search OR
          COALESCE(users."secondSurname", '') ILIKE :search OR
          users."documentId" ILIKE :search OR
          COALESCE(users.phone, '') ILIKE :search
        )`,
          { search: `%${searchTerm}%` }
        );
      }
    }

    if (query.roleName) {
      qb.innerJoin('users.roles', 'role').andWhere(
        'role.name ILIKE :roleName',
        {
          roleName: `%${query.roleName}%`,
        }
      );
    }

    const [data, total] = await qb
      .orderBy('users.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async create(
    userData: CreateUserDto,
    tenantCode: string,
    externalRepo?: Repository<User>,
    roleRepo?: Repository<Role>
  ): Promise<User | null> {
    const repo = externalRepo || this.usersRepository;
    const rRepo = roleRepo || this.usersRepository.manager.getRepository(Role);
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }
    const existingUserByDoc = await repo.findOne({
      where: { documentId: userData.documentId },
    });
    if (existingUserByDoc) {
      throw new ConflictException('El documento ya está registrado');
    }
    const existingUserByEmail = await repo.findOne({
      where: { email: userData.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('El correo ya está registrado');
    }
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      let roles: Role[] = [];
      // Procesar los roles recibidos como array de strings (IDs)
      if (userData.roles && userData.roles.length > 0) {
        console.log('Roles recibidos:', userData.roles);
        roles = await rRepo.find({
          where: { id: In(userData.roles) },
        });
        console.log('Roles encontrados en BD:', roles);
        if (roles.length === 0) {
          throw new BadRequestException(
            'No se encontraron los roles especificados'
          );
        }
      }
      // Crear el usuario
      const user = repo.create({
        firstName: userData.firstName,
        secondName: userData.secondName,
        firstSurname: userData.firstSurname,
        secondSurname: userData.secondSurname,
        email: userData.email,
        password: hashedPassword,
        documentType: userData.documentType,
        phone: userData.phone,
        documentId: userData.documentId,
        isEmailConfirmed: userData.isEmailConfirmed || false,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        roles, // Los roles ya están como objetos Role[]
      });
      const savedUser = await repo.save(user);

      const tenant = await this.tenantRepository.findOne({
        where: { code: tenantCode },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with code ${tenantCode} not found`);
      }

      const emailHtml = await render(
        UserRegisterEmail({
          userDetails: {
            nameUser: savedUser.firstName,
            emailUser: savedUser.email,
          },
          tenantCode: tenant?.code || 'app',
        })
      );

      await this.mailerService.sendMail({
        to: savedUser.email,
        subject: 'Bienvenido a Kuizi - Tu cuenta ha sido creada',
        html: emailHtml,
      });

      // Cargar el usuario con sus relaciones
      const userWithRoles = await repo.findOne({
        where: { id: savedUser.id },
        relations: ['roles'],
      });
      return userWithRoles;
    } catch (error) {
      console.error('Error en create:', error);
      if (error.code === '23505') {
        throw new ConflictException('Email o documento ya existen');
      }
      throw new InternalServerErrorException(
        'Unexpected error: ' + error.message
      );
    }
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findById(
    id: number,
    externalRepo?: Repository<User>
  ): Promise<{
    data: any;
    message: string;
    success: boolean;
  }> {
    const repo = externalRepo || this.usersRepository;
    const user = await repo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const allPermissions = user.roles
      .flatMap((role) => role.permissions)
      .filter(
        (perm, index, self) =>
          index === self.findIndex((p) => p.action === perm.action)
      )
      .map((perm) => ({
        action: perm.action,
        subject: perm.subject,
      }));

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
      data,
      message: 'Usuario cargado correctamente',
      success: true,
    };
  }

  async findOne(id: number, externalRepo?: Repository<User>): Promise<User> {
    const repo = externalRepo || this.usersRepository;
    const user = await repo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async toggleStatus(
    id: number,
    externalRepo?: Repository<User>
  ): Promise<User> {
    const repo = externalRepo || this.usersRepository;
    const user = await this.findOne(id, externalRepo);
    user.isActive = !user.isActive;
    return repo.save(user);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string; success: boolean }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual'
      );
    }
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);
    return {
      message: 'Contraseña actualizada correctamente',
      success: true,
    };
  }

  async remove(
    id: number,
    externalRepo?: Repository<User>
  ): Promise<{ message: string; success: boolean }> {
    const repo = externalRepo || this.usersRepository;
    const user = await repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await repo.delete(id);
    return {
      message: 'Usuario eliminado correctamente',
      success: true,
    };
  }

  async update(
    id: number,
    updateData: UpdateUserDto,
    externalRepo?: Repository<User>,
    roleRepo?: Repository<Role>
  ): Promise<User> {
    const repo = externalRepo || this.usersRepository;
    const rRepo = roleRepo || this.usersRepository.manager.getRepository(Role);
    const user = await repo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }
    if (updateData.documentId && updateData.documentId !== user.documentId) {
      const existingUserByDoc = await repo.findOne({
        where: { documentId: updateData.documentId },
      });
      if (existingUserByDoc && existingUserByDoc.id !== id) {
        throw new ConflictException('El documento ya está registrado');
      }
    }
    if (updateData.email && updateData.email !== user.email) {
      const existingUserByEmail = await repo.findOne({
        where: { email: updateData.email },
      });
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException('El correo ya está registrado');
      }
    }
    let roles: Role[] | undefined;
    if (updateData.roles && updateData.roles.length > 0) {
      roles = await rRepo.find({ where: { id: In(updateData.roles) } });
      if (roles.length === 0) {
        throw new BadRequestException(
          'No se encontraron los roles especificados'
        );
      }
    }
    Object.assign(user, {
      firstName: updateData.firstName,
      secondName: updateData.secondName,
      firstSurname: updateData.firstSurname,
      secondSurname: updateData.secondSurname,
      email: updateData.email,
      phone: updateData.phone,
      documentType: updateData.documentType,
      documentId: updateData.documentId,
      isActive: updateData.isActive,
      ...(updateData.password && { password: updateData.password }),
      ...(roles && { roles }),
    });
    const savedUser = await repo.save(user);
    return (await repo.findOne({
      where: { id: savedUser.id },
      relations: ['roles'],
    }))!;
  }
}
