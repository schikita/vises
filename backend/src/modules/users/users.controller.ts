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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { isPaginationRequested } from '../../shared/utils';
import { ADMIN_ROLE } from '../auth/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import type {
  ManagerNamesOut,
  UserCredentialsOut,
  UserOut,
  UsersPaginatedList,
} from './types';
import { parseUsersListQuery } from './utils';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(ADMIN_ROLE)
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('sort') sort?: string,
    @Query('sortDir') sortDir?: string,
  ): Promise<UserOut[] | UsersPaginatedList> {
    if (isPaginationRequested(page, pageSize)) {
      return this.users.listPaged(
        parseUsersListQuery({ page, pageSize, q, role, sort, sortDir }),
      );
    }
    return this.users.list();
  }

  /** Staff agent dropdown (ISSUE-002) — admin + manager. */
  @Get('managers')
  @Roles(ADMIN_ROLE, 'manager')
  listManagers(): Promise<ManagerNamesOut> {
    return this.users.listActiveManagerNames();
  }

  /** FastAPI returns 200 for POST create (not Nest default 201). */
  @Post()
  @Roles(ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  create(@Body() body: CreateUserDto): Promise<UserCredentialsOut> {
    return this.users.create(body);
  }

  @Patch(':userId')
  @Roles(ADMIN_ROLE)
  patch(
    @Param('userId') userId: string,
    @Body() body: PatchUserDto,
  ): Promise<UserOut> {
    return this.users.patch(userId, body);
  }

  @Post(':userId/reissue')
  @Roles(ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  reissue(@Param('userId') userId: string): Promise<UserCredentialsOut> {
    return this.users.reissue(userId);
  }

  @Delete(':userId')
  @Roles(ADMIN_ROLE)
  remove(
    @Param('userId') userId: string,
    @CurrentUser() actor: User,
  ): Promise<{ ok: true }> {
    return this.users.remove(userId, actor);
  }
}
