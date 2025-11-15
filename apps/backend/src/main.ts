import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import supertokens from 'supertokens-node';
import { plugin } from 'supertokens-node/framework/fastify';
import { errorHandler } from 'supertokens-node/framework/fastify';
import {
  initializeSuperTokens,
  ensureDefaultRolesExist,
} from './config/supertokens.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  initializeSuperTokens();

  // Ensure default roles exist after SuperTokens is initialized
  await ensureDefaultRolesExist();

  await app.register(plugin);

  await app.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    exposedHeaders: supertokens.getAllCORSHeaders(),
  });

  app.getHttpAdapter().getInstance().setErrorHandler(errorHandler());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
