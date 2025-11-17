import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifySession } from 'supertokens-node/recipe/session/framework/fastify';
import type { SessionRequest } from 'supertokens-node/framework/fastify';

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<SessionRequest>();
    const res = ctx.getResponse();

    try {
      await verifySession()(req, res);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Session verification failed');
    }
  }
}
