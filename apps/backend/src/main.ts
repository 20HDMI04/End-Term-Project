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
import { ValidationPipe } from '@nestjs/common';
import contentParser from '@fastify/multipart';

async function bootstrap() {
  // Initialize SuperTokens before creating the app
  initializeSuperTokens();

  const adapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);

  // Ensure default roles exist after SuperTokens is initialized
  await ensureDefaultRolesExist();

  // Get the raw Fastify instance
  const fastifyInstance = app.getHttpAdapter().getInstance();

  // Register CORS first
  await fastifyInstance.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    exposedHeaders: supertokens.getAllCORSHeaders(),
  });

  // Register SuperTokens plugin directly on Fastify instance
  await fastifyInstance.register(plugin);

  await fastifyInstance.register(contentParser, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
  });

  // Set error handler
  fastifyInstance.setErrorHandler(errorHandler());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
