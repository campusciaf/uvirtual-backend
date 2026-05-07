import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ForbiddenFilter } from './common/filters/forbidden.filter';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VoltAgentService } from './api/v1/voltagent/voltagent.service';
import { setupVoltAgentWebSocket } from './api/v1/voltagent/voltagent.websocket.setup';

// Establecer la zona horaria para toda la app
process.env.TZ = 'America/Bogota';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validaciones
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     transform: true,
  //   })
  // );
  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      const findFirstMessage = (errs: any[]): string => {
        for (const e of errs) {
          if (e.constraints) {
            return Object.values(e.constraints)[0] as string;
          }
          if (e.children && e.children.length > 0) {
            const child = findFirstMessage(e.children);
            if (child) return child;
          }
        }
        return 'Error de validación';
      };
      return new (require('@nestjs/common').BadRequestException)(findFirstMessage(errors));
    }
  })
);

  // CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-tenant-id',
      'X-Skip-Tenant',
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Filtros globales
  app.useGlobalFilters(new ForbiddenFilter());

  console.log('🚀 UVirtual API Configurada:');
  console.log('   - Versioning: URI (v1, v2, etc.)');
  console.log('   - Global Prefix: /api');
  console.log('   - Rutas disponibles: /api/v1/*, /api/v2/*, etc.');
  console.log('   - Zona horaria: America/Bogota');

  app.enableShutdownHooks();
  const voltAgentService = app.get(VoltAgentService);
  const wss = setupVoltAgentWebSocket(app, voltAgentService, "/voltagent/ws");

  app.getHttpServer().on("close", () => {
    wss.close();
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
