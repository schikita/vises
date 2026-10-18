import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserOut } from '../users/types';

@Controller('invite')
export class InviteController {
  constructor(private readonly auth: AuthService) {}

  @Get(':token')
  invite(@Param('token') token: string): Promise<UserOut> {
    return this.auth.invite(token);
  }
}
