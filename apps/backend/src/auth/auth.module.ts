import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RolesController } from './roles.controller';

@Module({
  controllers: [AuthController, RolesController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
