import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import UserRoles from 'supertokens-node/recipe/userroles';
import type { SessionRequest } from 'supertokens-node/framework/fastify';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<SessionRequest>();
    const session = req.session;

    if (!session) {
      throw new ForbiddenException('No session found');
    }

    const roles = await session.getClaimValue(UserRoles.UserRoleClaim);

    const hasRole = this.allowedRoles.some((role) => roles?.includes(role));

    if (!hasRole) {
      const payload = session.getAccessTokenPayload();
      const roles = payload['st-role']?.v || [];
      const hasRoleInside = this.allowedRoles.some((role) =>
        roles?.includes(role),
      );
      if (!hasRoleInside) {
        throw new ForbiddenException(
          'You do not have the required permissions',
        );
      }
    }

    return true;
  }
}
