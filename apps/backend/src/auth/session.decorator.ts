import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';

/**
 * @summary Session decorator
 * @description A custom NestJS parameter decorator that extracts the session information from the request object. This decorator is used to access the session data in route handlers, allowing you to retrieve user-specific information stored in the session. The session data is typically managed by the SuperTokens library, and this decorator provides a convenient way to access it within your controllers.
 * @returns The session container object containing session data for the current request.
 */
export const Session = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionContainer => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);
