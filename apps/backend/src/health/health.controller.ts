import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SessionGuard } from '../auth/session.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  async healthCheck(@Req() req: FastifyRequest) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is healthy and session is verified',
    };
  }
}
