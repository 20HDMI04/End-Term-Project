import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SessionGuard } from './session.guard';
import UserRoles from 'supertokens-node/recipe/userroles';
import { env } from 'process';
import { RolesGuard } from './roles.guard';

@Controller('roles')
export class RolesController {
  @Post('create')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async createRole(
    @Body() body: { role: string },
    @Req() req: FastifyRequest & { session: any },
  ) {
    if (req.session.email != env.email_admin) {
      return { error: 'Unauthorized' };
    }
    await UserRoles.createNewRoleOrAddPermissions(body.role, []);
    return { message: `Role "${body.role}" created successfully` };
  }

  @Post('assign')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async assignRole(
    @Body() body: { userId: string; role: string },
    @Req() req: FastifyRequest & { session: any },
  ) {
    if (req.session.email != env.email_admin) {
      return { error: 'Unauthorized' };
    }

    const result = await UserRoles.addRoleToUser(
      'public',
      body.userId,
      body.role,
    );

    if (result.status === 'OK') {
      return { message: `Role "${body.role}" assigned to user` };
    }

    return { error: 'Failed to assign role' };
  }

  @Post('get')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async getUserRoles(@Req() req: FastifyRequest & { session: any }) {
    if (req.session.email != env.email_admin) {
      return { error: 'Unauthorized' };
    }
    const userId = req.session.getUserId();
    const result = await UserRoles.getRolesForUser('public', userId);

    return {
      userId,
      roles: result.roles,
    };
  }

  @Post('remove')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async removeRole(
    @Body() body: { userId: string; role: string },
    @Req() req: FastifyRequest & { session: any },
  ) {
    if (req.session.email != env.email_admin) {
      return { error: 'Unauthorized' };
    }
    const result = await UserRoles.removeUserRole(
      'public',
      body.userId,
      body.role,
    );

    if (result.status === 'OK') {
      return { message: `Role "${body.role}" removed from user` };
    }

    return { error: 'Failed to remove role' };
  }

  @Post('remove-new-role')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async removeNewRole(@Req() req: FastifyRequest & { session: any }) {
    if (req.session.email != env.email_admin) {
      return { error: 'Unauthorized' };
    }
    const result = await UserRoles.deleteRole('new_role');
    if (result.status === 'OK') {
      return { message: `Role "new_role" deleted successfully` };
    }
    return { error: 'Failed to delete role' };
  }
}
