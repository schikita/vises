import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { MAX_UPLOAD_BYTES } from '../../shared/constants';
import { isPaginationRequested } from '../../shared/utils';
import { UpsertAppDto } from './dto/upsert-app.dto';
import type {
  AppOutWithPortalProgress,
  AppsPaginatedList,
  AppsUpsertHttpResponse,
} from './types';
import { parseAppsListQuery } from './utils';
import { AppsService } from './apps.service';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly apps: AppsService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('sort') sort?: string,
    @Query('sortDir') sortDir?: string,
  ): Promise<AppOutWithPortalProgress[] | AppsPaginatedList> {
    if (isPaginationRequested(page, pageSize)) {
      return this.apps.listPaged(
        user,
        parseAppsListQuery({ page, pageSize, q, status, city, sort, sortDir }),
      );
    }
    return this.apps.list(user);
  }

  /** FastAPI returns 200 for POST upsert (not Nest default 201). */
  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(
    @Body() body: UpsertAppDto,
    @CurrentUser() user: User,
  ): Promise<AppsUpsertHttpResponse> {
    return this.apps.upsert(body, user);
  }

  @Delete(':appId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin', 'agent')
  remove(@Param('appId') appId: string): Promise<{ ok: true }> {
    return this.apps.remove(appId);
  }

  @Post(':appId/docs')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  addDoc(
    @Param('appId') appId: string,
    @Body('type') type: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<AppOutWithPortalProgress> {
    return this.apps.addDoc(appId, type || '', file, user);
  }

  @Get(':appId/docs/:docId')
  async getDoc(
    @Param('appId') appId: string,
    @Param('docId') docId: string,
    @CurrentUser() user: User,
  ): Promise<StreamableFile> {
    const { stream, filename } = await this.apps.getDocStream(
      appId,
      docId,
      user,
    );
    return new StreamableFile(stream as import('stream').Readable, {
      disposition: `attachment; filename="${filename.replace(/"/g, '')}"`,
    });
  }

  /**
   * Detail-by-id (DEC-007). Declared after nested `:appId/docs/…` routes so
   * static portal-autofill paths on the sibling controller remain unambiguous.
   */
  @Get(':appId')
  getById(
    @Param('appId') appId: string,
    @CurrentUser() user: User,
  ): Promise<AppOutWithPortalProgress> {
    return this.apps.getById(appId, user);
  }
}
