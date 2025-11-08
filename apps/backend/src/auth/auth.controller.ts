import { Controller, All, Req, Res } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    return res.status(404).send({ message: 'Not found' });
  }
}
