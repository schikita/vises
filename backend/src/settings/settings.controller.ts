import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PatchSettingsDto } from './dto/patch-settings.dto';
import type { SettingsOut } from './types';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** Any authenticated user (REQ-014). */
  @Get()
  get(): Promise<SettingsOut> {
    return this.settings.get();
  }

  /** Admin only (REQ-014). */
  @Patch()
  @UseGuards(RolesGuard)
  @Roles('admin')
  patch(@Body() body: PatchSettingsDto): Promise<SettingsOut> {
    return this.settings.patch(body);
  }

  /** Admin only — clear domains then re-seed (REQ-014 / REQ-015). */
  @Post('reset-demo')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin')
  resetDemo(): Promise<{ ok: true }> {
    return this.settings.resetDemo();
  }
}
