import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SessionGuard } from '../auth/session.guard';

@Controller('health')
export class HealthController {
  @Get()
  @UseGuards(SessionGuard)
  async healthCheck(@Req() req: FastifyRequest & { session: any }) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      userId: req.session.getUserId(),
      message: 'Server is healthy and session is verified',
    };
  }
}
