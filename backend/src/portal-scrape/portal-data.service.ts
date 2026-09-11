import {
  HttpException,
  HttpStatus,
  Injectable,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import type { IPortalDataService } from './interfaces';
import type {
  ApplicantInput,
  ApplicationInput,
  LoadApplicationOptions,
  LoadedApplicationData,
} from './types';

function findApplicant(
  application: ApplicationInput,
  applicantId: string,
): ApplicantInput | undefined {
  const list = application.applicants ?? [];
  return list.find((a) => String(a.id) === applicantId);
}

/**
 * Load Application via TypeORM (prior DEC-011).
 * DB not-found maps to HTTP 404 with Russian detail (portal-autofill-api DEC-009).
 * Offline JSON fixture path removed (DEC-003).
 */
@Injectable()
export class PortalDataService implements IPortalDataService {
  constructor(
    @Optional()
    @InjectRepository(Application)
    private readonly apps?: Repository<Application>,
  ) {}

  async load(options: LoadApplicationOptions): Promise<LoadedApplicationData> {
    const { applicationId, applicantId } = options;

    if (!applicationId?.trim()) {
      throw new HttpException(
        'Укажите идентификатор заявки',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!applicantId?.trim()) {
      throw new HttpException(
        'Укажите идентификатор заявителя',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.loadFromDatabase(applicationId, applicantId);
  }

  private async loadFromDatabase(
    applicationId: string,
    applicantId: string,
  ): Promise<LoadedApplicationData> {
    if (!this.apps) {
      throw new Error(
        'TypeORM Application repository unavailable; run against AppModule with DATABASE_URL',
      );
    }
    const row = await this.apps.findOne({ where: { id: applicationId } });
    if (!row) {
      throw new HttpException('Нет такой заявки', HttpStatus.NOT_FOUND);
    }

    const applicantsRaw = row.applicants;
    const applicants: ApplicantInput[] = Array.isArray(applicantsRaw)
      ? (applicantsRaw as ApplicantInput[])
      : [];

    const application: ApplicationInput = {
      id: row.id,
      clientEmail: row.clientEmail,
      applicants,
    };

    const applicant = findApplicant(application, applicantId);
    if (!applicant) {
      throw new HttpException(
        `Заявитель «${applicantId}» не найден`,
        HttpStatus.NOT_FOUND,
      );
    }

    return { application, applicant, source: 'database' };
  }
}
