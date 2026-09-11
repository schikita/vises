import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { appOut } from '../common/mappers';
import { assertValidUpload, safeFilename, uid, utcNow } from '../common/utils';
import { UsersService } from '../users/users.service';
import { DEFAULT_APP_STATUS, DEFAULT_PAYMENT_AMOUNT } from './constants';
import { UpsertAppDto } from './dto/upsert-app.dto';
import type { IAppsService } from './interfaces';
import type { AppOut, DocMeta, TimelineItem, UpsertAppResult } from './types';
import {
  appDocumentExists,
  applyClientPrivilegedCoerce,
  assertClientOwns,
  canSeeApp,
  copyPrimaryApplicantEmailIfBlank,
  deriveClientNameFromApplicants,
  ensureUploadRoot,
  extrasIn,
  generateAppCode,
  mergeDocuments,
  openAppDocumentStream,
  resolveAppDocumentPath,
  resolveUploadDir,
  writeAppDocumentFile,
} from './utils';

@Injectable()
export class AppsService implements IAppsService {
  private readonly uploadDir = resolveUploadDir();

  constructor(
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
    private readonly usersService: UsersService,
  ) {
    ensureUploadRoot(this.uploadDir);
  }

  async list(user: User): Promise<AppOut[]> {
    const qb = this.apps
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC');

    if (user.role === 'client') {
      qb.where(
        'a.client_email = :email OR a.client_email = :login',
        { email: user.email, login: user.login },
      );
    }

    const rows = await qb.getMany();
    return rows.map((a) => appOut(a));
  }

  async upsert(body: UpsertAppDto, user: User): Promise<UpsertAppResult> {
    const appId = body.id || uid('app');
    let row = await this.apps.findOne({ where: { id: appId } });
    const now = utcNow();
    const isCreate = !row;
    const isClient = user.role === 'client';
    const isStaff = user.role === 'admin' || user.role === 'manager';

    let applicants = (body.applicants ?? []) as unknown[];
    let clientEmail = body.clientEmail || user.email || user.login;
    let issuedClientAccess: UpsertAppResult['issuedClientAccess'];

    if (isCreate && isStaff) {
      const identity = (body.clientEmail ?? '').trim();
      if (!identity) {
        throw new HttpException(
          'Укажите email или логин клиента',
          HttpStatus.BAD_REQUEST,
        );
      }

      const name = deriveClientNameFromApplicants(applicants);
      const ensured = await this.usersService.ensureClientForIdentity(
        identity,
        name,
      );
      clientEmail = ensured.user.email || ensured.user.login;
      applicants = copyPrimaryApplicantEmailIfBlank(applicants, clientEmail);

      if (ensured.created && ensured.password && ensured.token) {
        issuedClientAccess = {
          user: ensured.user,
          password: ensured.password,
          token: ensured.token,
        };
      }
    }

    if (row) {
      assertClientOwns(user, row);
    } else {
      assertClientOwns(user, {
        clientEmail,
      } as Application);
    }

    const privileged = isClient
      ? applyClientPrivilegedCoerce(body, row)
      : {
          status: body.status ?? DEFAULT_APP_STATUS,
          paymentAmount: body.paymentAmount ?? DEFAULT_PAYMENT_AMOUNT,
          paymentPaid: Boolean(body.paymentPaid),
          paymentNote: body.paymentNote ?? '',
          visitDate: body.visitDate ?? '',
          visitTime: body.visitTime ?? '',
          visitPlace: body.visitPlace ?? '',
          manager: body.manager ?? '',
        };

    const existingDocs = ((row?.documents as DocMeta[]) || []) as DocMeta[];
    const documents = mergeDocuments(existingDocs, body.documents);

    const payload: Partial<Application> = {
      code: body.code || generateAppCode(),
      clientEmail,
      status: privileged.status,
      destination: body.destination ?? '',
      visaType: body.visaType ?? '',
      submitCountry: body.submitCountry ?? '',
      submitCity: body.submitCity ?? '',
      travelDate: body.travelDate ?? '',
      returnDate: body.returnDate ?? '',
      comment: body.comment ?? '',
      applicants,
      documents,
      paymentAmount: privileged.paymentAmount,
      paymentPaid: privileged.paymentPaid,
      paymentNote: privileged.paymentNote,
      visitDate: privileged.visitDate,
      visitTime: privileged.visitTime,
      visitPlace: privileged.visitPlace,
      manager: privileged.manager,
      extras: extrasIn(body),
      timeline: body.timeline ?? [],
      updatedAt: now,
    };

    if (row) {
      Object.assign(row, payload);
    } else {
      row = this.apps.create({
        id: appId,
        createdAt: now,
        ...payload,
      });
    }

    await this.apps.save(row);
    const out: UpsertAppResult = appOut(row);
    if (issuedClientAccess) {
      out.issuedClientAccess = issuedClientAccess;
    }
    return out;
  }

  async remove(appId: string): Promise<{ ok: true }> {
    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Нет такой заявки', HttpStatus.NOT_FOUND);
    }
    await this.apps.remove(row);
    return { ok: true };
  }

  async addDoc(
    appId: string,
    type: string,
    file: Express.Multer.File | undefined,
    user: User,
  ): Promise<AppOut> {
    assertValidUpload(file);

    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Нет такой заявки', HttpStatus.NOT_FOUND);
    }
    assertClientOwns(user, row);

    const docId = uid('doc');
    const safe = safeFilename(file.originalname);
    const stored = `${docId}_${safe}`;
    writeAppDocumentFile(this.uploadDir, appId, stored, file.buffer);

    const now = utcNow();
    const docs = [...((row.documents as DocMeta[]) || [])];
    docs.push({
      id: docId,
      type,
      name: file.originalname || safe,
      stored,
      uploadedAt: now.toISOString(),
    });

    const timeline = [...((row.timeline as TimelineItem[]) || [])];
    timeline.push({
      at: now.toISOString(),
      text: `Файл: ${file.originalname}`,
      actor: user.name,
    });

    row.documents = docs;
    row.timeline = timeline;
    row.updatedAt = now;
    await this.apps.save(row);
    return appOut(row);
  }

  async getDocStream(
    appId: string,
    docId: string,
    user: User,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Нет такой заявки', HttpStatus.NOT_FOUND);
    }
    if (!canSeeApp(user, row)) {
      throw new HttpException('Чужая заявка', HttpStatus.FORBIDDEN);
    }

    const docs = (row.documents as DocMeta[]) || [];
    const doc = docs.find((d) => d?.id === docId);
    if (!doc) {
      throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
    }

    const stored = doc.stored || `${docId}_${doc.name || 'file'}`;
    const path = resolveAppDocumentPath(this.uploadDir, appId, stored);
    if (!appDocumentExists(path)) {
      throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
    }

    return {
      stream: openAppDocumentStream(path),
      filename: doc.name || stored,
    };
  }
}
