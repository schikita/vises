import {
  HttpException,
  HttpStatus,
  Injectable,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import type { IPortalApplicationData } from './interfaces/portal-application-data.interface';
import type {
  ApplicantInput,
  ApplicationInput,
  LoadApplicationOptions,
  LoadedApplicationData,
} from './types/portal-mapping.types';
import { findApplicant } from './utils/find-applicant.util';

/**
 * Load Application via TypeORM (prior DEC-011).
 * DB not-found maps to HTTP 404 with detail message (portal-autofill-api DEC-009).
 * Offline JSON fixture path removed (DEC-003).
 */
@Injectable()
export class PortalDataService implements IPortalApplicationData {
  constructor(
    @Optional()
    @InjectRepository(Application)
    private readonly apps?: Repository<Application>,
  ) {}

  async load(options: LoadApplicationOptions): Promise<LoadedApplicationData> {
    const { applicationId, applicantId } = options;

    if (!applicationId?.trim()) {
      throw new HttpException(
        'Application ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!applicantId?.trim()) {
      throw new HttpException(
        'Applicant ID is required',
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
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    const applicantsRaw = row.applicants;
    const applicants: ApplicantInput[] = Array.isArray(applicantsRaw)
      ? (applicantsRaw as ApplicantInput[])
      : [];

    const application: ApplicationInput = {
      id: row.id,
      clientEmail: row.clientEmail,
      submitCountry: row.submitCountry ?? '',
      applicants,
    };

    const applicant = findApplicant(application, applicantId);
    if (!applicant) {
      throw new HttpException(
        `Applicant "${applicantId}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return { application, applicant, source: 'database' };
  }
}
