import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ApiV1Module } from './api/v1/v1.module';

import { Tenant } from './core/tenant/entities/tenant.entity';
import { Module as TenancyModuleClass } from './core/tenant/entities/modules.entity';
import { ModulesTenant } from './core/tenant/entities/modules-tenants.entity';

import { TenancyModule } from './core/tenant/tenant.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtTenancyMiddleware } from './core/tenant/middlewares/jwt-tenancy.middleware';

import { TenantAccessModule } from 'src/core/tenant-access/tenant-access.module';
import { CaslModule } from './api/v1/auth/casl/casl.module';
import { LoginAttempt } from './api/v1/auth/entities/login-attempt.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import awsConfig from './api/v1/common/s3/config/aws.config';

import { validateEnv } from './core/config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [awsConfig],
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),

    TypeOrmModule.forRootAsync({
      name: 'management',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          Tenant,
          TenancyModuleClass,
          ModulesTenant,
          LoginAttempt,
        ],
        synchronize: true,
      }),
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: !!configService.get<number>('EMAIL_SECURE'),
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"UVirtual" <${configService.get<string>('EMAIL_USERNAME')}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),

    TenantAccessModule,
    TenancyModule,
    CaslModule,
    ApiV1Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtTenancyMiddleware)
      .exclude(
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/register', method: RequestMethod.POST },
        { path: 'api/v1/auth/forgot-password', method: RequestMethod.POST },
        { path: 'health', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}
