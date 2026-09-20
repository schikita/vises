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
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PatchSettingsDto } from './dto/patch-settings.dto';
import type { SettingsOut, WebshareProxiesOut } from './types';
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

  /** Admin: cached Webshare proxies (masked) + last refresh (DEC-003). */
  @Get('webshare-proxies')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listWebshareProxies(): WebshareProxiesOut {
    return this.settings.listWebshareProxies();
  }

  /** Admin: force-refresh Webshare proxy list (DEC-003). */
  @Post('webshare-proxies/refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin')
  refreshWebshareProxies(): Promise<WebshareProxiesOut> {
    return this.settings.refreshWebshareProxies();
  }
}
