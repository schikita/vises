import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { UserMeDto } from '@vises/contracts';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { AuthService } from './auth.service';
import { DemoDto } from './dto/demo.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthSession } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto): Promise<AuthSession> {
    return this.auth.login(body.login, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterDto): Promise<AuthSession> {
    return this.auth.register(body);
  }

  @Post('demo')
  demo(@Body() body: DemoDto): Promise<AuthSession> {
    return this.auth.demo(body.role);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): UserMeDto {
    return this.auth.me(user);
  }
}
