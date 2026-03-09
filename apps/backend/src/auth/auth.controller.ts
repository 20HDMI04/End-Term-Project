import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { SessionGuard } from './session.guard';
import { Session } from './session.decorator';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  @Get('session-info')
  @ApiOperation({ summary: 'Get current session information' })
  @ApiCookieAuth()
  @UseGuards(new SessionGuard())
  async getSessionInfo(@Session() session: SessionContainer) {
    const accessTokenPayload = session.getAccessTokenPayload();
    console.log(
      '[Auth] Session Info Request - Payload:',
      JSON.stringify(accessTokenPayload, null, 2),
    );

    return {
      userId: session.getUserId(),
      roles: accessTokenPayload.roles || [],
      email: accessTokenPayload.email,
      tenantId: session.getTenantId(),
      fullPayload: accessTokenPayload,
    };
  }
}
