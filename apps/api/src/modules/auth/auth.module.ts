import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { AUTH_SERVICE } from './constants';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AuthController } from './auth.controller';
import { InviteController } from './invite.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController, InviteController],
  providers: [
    AuthService,
    { provide: AUTH_SERVICE, useExisting: AuthService },
    JwtTokenService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    AUTH_SERVICE,
    JwtTokenService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
