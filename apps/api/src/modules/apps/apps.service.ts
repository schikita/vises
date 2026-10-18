import { randomUUID } from 'crypto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { WORKFLOW_ROUTING_KEYS } from '@vises/contracts';
import { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { Application } from '../database/entities/application.entity';
import type { ApplicationApplicant } from '../database/types';
import { User } from '../database/entities/user.entity';
import { appOut } from '../../shared/mappers';
import {
  assertValidUpload,
  buildPaginatedList,
  safeFilename,
  uid,
  utcNow,
} from '../../shared/utils';
import { BlsWorkflowService } from '../bls-workflow';
import { WorkflowBusPublisherService } from '../messaging';
import { PortalAutofillService } from '../portal-scrape';
import { UsersService } from '../users/users.service';
import { DEFAULT_APP_STATUS, DEFAULT_PAYMENT_AMOUNT } from './constants';
import { UpsertAppDto } from './dto/upsert-app.dto';
import type { IAppsService } from './interfaces';
import type {
  AppOutWithPortalProgress,
  AppsListQuery,
  AppsPaginatedList,
  AppsUpsertHttpResponse,
  DocMeta,
  PaymentsListQuery,
  PaymentsPaginatedList,
  TimelineItem,
  UpsertAppResult,
  VisitsListQuery,
  VisitsPaginatedList,
} from './types';
import {
  appDocumentExists,
  applyAppsListFilters,
  applyAppsListSort,
  applyAppsVisibilityScope,
  applyClientPrivilegedCoerce,
  applyVisitsEligibilityFilter,
  applyVisitsListFilters,
  applyVisitsListSort,
  applyVisitsModeFilter,
  assertClientOwns,
  canSeeApp,
  copyPrimaryApplicantEmailIfBlank,
  deriveClientNameFromApplicants,
  ensureUploadRoot,
  extrasIn,
  generateAppCode,
  joinVisitsRelatedUser,
  mergeDocuments,
  openAppDocumentStream,
  resolveAppDocumentPath,
  resolveUploadDir,
  writeAppDocumentFile,
} from './utils';

@Injectable()
export class AppsService implements IAppsService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
    private readonly usersService: UsersService,
    private readonly portalAutofill: PortalAutofillService,
    private readonly workflows: BlsWorkflowService,
    private readonly workflowBus: WorkflowBusPublisherService,
    config: ConfigService<AppEnv, true>,
  ) {
    this.uploadDir = resolveUploadDir(
      config.get('UPLOAD_DIR', { infer: true }),
    );
    ensureUploadRoot(this.uploadDir);
  }

  async list(user: User): Promise<AppOutWithPortalProgress[]> {
    const qb = this.apps
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC');

    applyAppsVisibilityScope(qb, user);

    const rows = await qb.getMany();
    return this.withPortalProgress(rows);
  }

  async listPaged(
    user: User,
    query: AppsListQuery,
  ): Promise<AppsPaginatedList> {
    const citiesQb = this.apps
      .createQueryBuilder('a')
      .select('DISTINCT a.submit_city', 'city');
    applyAppsVisibilityScope(citiesQb, user);
    const cityRows = await citiesQb.getRawMany<{ city: string }>();
    const cities = cityRows
      .map((row) => row.city)
      .filter((city): city is string => Boolean(city));

    const countQb = this.apps.createQueryBuilder('a');
    applyAppsVisibilityScope(countQb, user);
    applyAppsListFilters(countQb, query);
    const total = await countQb.getCount();

    const qb = this.apps.createQueryBuilder('a');
    applyAppsVisibilityScope(qb, user);
    applyAppsListFilters(qb, query);
    applyAppsListSort(qb, query.sort, query.sortDir);
    const rows = await qb
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const items = await this.withPortalProgress(rows);
    return {
      ...buildPaginatedList({
        items,
        total,
        page: query.page,
        pageSize: query.pageSize,
      }),
      cities,
    };
  }

  async getById(
    appId: string,
    user: User,
  ): Promise<AppOutWithPortalProgress> {
    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }
    if (!canSeeApp(user, row)) {
      throw new HttpException('Not your application', HttpStatus.FORBIDDEN);
    }
    const [out] = await this.withPortalProgress([row]);
    return out;
  }

  async listVisits(query: VisitsListQuery): Promise<VisitsPaginatedList> {
    const citiesQb = this.apps
      .createQueryBuilder('a')
      .select('DISTINCT a.submit_city', 'city');
    applyVisitsEligibilityFilter(citiesQb);
    const cityRows = await citiesQb.getRawMany<{ city: string }>();
    const cities = cityRows
      .map((row) => row.city)
      .filter((city): city is string => Boolean(city));

    const countQb = this.apps.createQueryBuilder('a');
    applyVisitsEligibilityFilter(countQb);
    joinVisitsRelatedUser(countQb);
    applyVisitsModeFilter(countQb, query.mode, query.todayIsoDate);
    applyVisitsListFilters(countQb, query);
    const total = await countQb.distinct(true).getCount();

    const qb = this.apps.createQueryBuilder('a');
    applyVisitsEligibilityFilter(qb);
    joinVisitsRelatedUser(qb);
    applyVisitsModeFilter(qb, query.mode, query.todayIsoDate);
    applyVisitsListFilters(qb, query);
    applyVisitsListSort(qb, query.sort, query.sortDir);
    const rows = await qb
      .distinct(true)
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const items = await this.withPortalProgress(rows);
    return {
      ...buildPaginatedList({
        items,
        total,
        page: query.page,
        pageSize: query.pageSize,
      }),
      cities,
    };
  }

  async listPayments(
    query: PaymentsListQuery,
  ): Promise<PaymentsPaginatedList> {
    const summaryRaw = await this.apps
      .createQueryBuilder('a')
      .select(
        'COALESCE(SUM(CASE WHEN a.payment_paid THEN a.payment_amount ELSE 0 END), 0)',
        'paidTotal',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN NOT a.payment_paid THEN a.payment_amount ELSE 0 END), 0)',
        'unpaidTotal',
      )
      .getRawOne<{ paidTotal: string; unpaidTotal: string }>();

    const summary = {
      paidTotal: Number(summaryRaw?.paidTotal ?? 0),
      unpaidTotal: Number(summaryRaw?.unpaidTotal ?? 0),
    };

    const total = await this.apps.createQueryBuilder('a').getCount();
    const rows = await this.apps
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const items = await this.withPortalProgress(rows);
    return {
      ...buildPaginatedList({
        items,
        total,
        page: query.page,
        pageSize: query.pageSize,
      }),
      summary,
    };
  }

  async upsert(body: UpsertAppDto, user: User): Promise<AppsUpsertHttpResponse> {
    const appId = body.id || uid('app');
    let row = await this.apps.findOne({ where: { id: appId } });
    const now = utcNow();
    const isCreate = !row;
    const isClient = user.role === 'client';
    const isStaff = user.role === 'admin' || user.role === 'manager';

    let applicants = (body.applicants ?? []) as ApplicationApplicant[];
    let clientEmail = body.clientEmail || user.email || user.login;
    let issuedClientAccess: UpsertAppResult['issuedClientAccess'];

    if (isCreate && isStaff) {
      const identity = (body.clientEmail ?? '').trim();
      if (!identity) {
        throw new HttpException(
          'Client email is required',
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
    const [base] = await this.withPortalProgress([row]);

    const correlationId = randomUUID();
    const workflowAction =
      !isStaff
        ? 'none'
        : (body.portalWorkflowAction ?? 'ensure');

    let arm = {
      applicationId: row.id,
      workflowId: undefined as string | undefined,
      workflowAction: workflowAction as 'ensure' | 'supersede' | 'none',
      created: false,
    };

    if (workflowAction !== 'none') {
      const ensured = await this.workflows.ensureForApplication({
        applicationId: row.id,
        triggeredByUserId: user.id,
        action: workflowAction,
      });
      arm = {
        applicationId: row.id,
        workflowId: ensured.workflowId,
        workflowAction: ensured.workflowAction,
        created: ensured.created,
      };

      if (ensured.created && ensured.workflowId) {
        await this.workflowBus.publish({
          routingKey: WORKFLOW_ROUTING_KEYS.CREATED,
          message: {
            correlationId,
            payload: {
              workflowId: ensured.workflowId,
              applicationId: row.id,
            },
          },
        });
      }
      if (ensured.workflowId && ensured.workflowAction !== 'none') {
        await this.workflowBus.publish({
          routingKey: WORKFLOW_ROUTING_KEYS.SCHEDULE,
          message: {
            correlationId,
            payload: {
              workflowId: ensured.workflowId,
              applicationId: row.id,
              scheduledAt: new Date().toISOString(),
            },
          },
        });
      }
    }

    const response: AppsUpsertHttpResponse = {
      correlationId,
      payload: arm,
      application: base,
    };
    if (issuedClientAccess) {
      response.issuedClientAccess = issuedClientAccess;
    }
    return response;
  }

  async remove(appId: string): Promise<{ ok: true }> {
    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }
    await this.apps.remove(row);
    return { ok: true };
  }

  async addDoc(
    appId: string,
    type: string,
    file: Express.Multer.File | undefined,
    user: User,
  ): Promise<AppOutWithPortalProgress> {
    assertValidUpload(file);

    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
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
      text: `File: ${file.originalname}`,
      actor: user.name,
    });

    row.documents = docs;
    row.timeline = timeline;
    row.updatedAt = now;
    await this.apps.save(row);
    const [out] = await this.withPortalProgress([row]);
    return out;
  }

  async getDocStream(
    appId: string,
    docId: string,
    user: User,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const row = await this.apps.findOne({ where: { id: appId } });
    if (!row) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }
    if (!canSeeApp(user, row)) {
      throw new HttpException('Not your application', HttpStatus.FORBIDDEN);
    }

    const docs = (row.documents as DocMeta[]) || [];
    const doc = docs.find((d) => d?.id === docId);
    if (!doc) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const stored = doc.stored || `${docId}_${doc.name || 'file'}`;
    const path = resolveAppDocumentPath(this.uploadDir, appId, stored);
    if (!appDocumentExists(path)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return {
      stream: openAppDocumentStream(path),
      filename: doc.name || stored,
    };
  }

  private async withPortalProgress(
    rows: Application[],
  ): Promise<AppOutWithPortalProgress[]> {
    const progressById =
      await this.portalAutofill.getClientPortalProgressForApps(
        rows.map((row) => ({
          id: row.id,
          submitCountry: row.submitCountry ?? '',
          applicants: row.applicants,
        })),
      );

    return rows.map((row) => ({
      ...appOut(row),
      portalProgress: progressById.get(row.id)!,
    }));
  }
}
