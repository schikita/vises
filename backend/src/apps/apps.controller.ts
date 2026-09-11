import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { MAX_UPLOAD_BYTES } from '../common/constants';
import { UpsertAppDto } from './dto/upsert-app.dto';
import type { AppOut, UpsertAppResult } from './types';
import { AppsService } from './apps.service';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly apps: AppsService) {}

  @Get()
  list(@CurrentUser() user: User): Promise<AppOut[]> {
    return this.apps.list(user);
  }

  /** FastAPI returns 200 for POST upsert (not Nest default 201). */
  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(
    @Body() body: UpsertAppDto,
    @CurrentUser() user: User,
  ): Promise<UpsertAppResult> {
    return this.apps.upsert(body, user);
  }

  @Delete(':appId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
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
  ): Promise<AppOut> {
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
}
