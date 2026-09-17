import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ADMIN_ROLE } from '../auth/constants';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import type { UserCredentialsOut, UserOut } from './types';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(): Promise<UserOut[]> {
    return this.users.list();
  }

  /** FastAPI returns 200 for POST create (not Nest default 201). */
  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() body: CreateUserDto): Promise<UserCredentialsOut> {
    return this.users.create(body);
  }

  @Patch(':userId')
  patch(
    @Param('userId') userId: string,
    @Body() body: PatchUserDto,
  ): Promise<UserOut> {
    return this.users.patch(userId, body);
  }

  @Post(':userId/reissue')
  @HttpCode(HttpStatus.OK)
  reissue(@Param('userId') userId: string): Promise<UserCredentialsOut> {
    return this.users.reissue(userId);
  }

  @Delete(':userId')
  remove(
    @Param('userId') userId: string,
    @CurrentUser() actor: User,
  ): Promise<{ ok: true }> {
    return this.users.remove(userId, actor);
  }
}
