import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  ApplicationDto,
  ApplicationStatusHistoryResponseDto,
} from '@vises/contracts';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  SUPERADMIN_ROLE,
} from '../auth/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../database/entities/user.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationStatusChangeDto } from './dto/application-status-change.dto';

/**
 * Staff application status transitions + history (FR-7.4 / §6.6 / AC-12 / AC-14 / T14.2).
 */
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get(':applicationId/history')
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  getHistory(
    @Param('applicationId') applicationId: string,
    @CurrentUser() actor: User,
  ): Promise<ApplicationStatusHistoryResponseDto> {
    return this.applications.getHistory(applicationId, actor);
  }

  @Post(':applicationId/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  changeStatus(
    @Param('applicationId') applicationId: string,
    @Body() body: ApplicationStatusChangeDto,
    @CurrentUser() actor: User,
  ): Promise<ApplicationDto> {
    return this.applications.changeStatus(applicationId, body, actor);
  }
}
