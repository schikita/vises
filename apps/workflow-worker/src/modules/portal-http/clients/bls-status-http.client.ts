/**
 * HTTP-based STATUS client: login -> myappointments -> applicant row status.
 * "Form Filling In-Progress" -> auto-complete the ManageApplicant form for the
 * booking visa type -> re-check. Success only on "Ready To Book Appointment".
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { PortalHttpService } from '../portal-http.service';
import { PortalHttpFlowService } from '../portal-http-flow.service';
import { BlsSecretVaultService } from '../../bls-secrets/bls-secret-vault.service';
import { BLS_SECRET_PURPOSE } from '../../bls-secrets/constants/bls-secret-purpose.constants';
import type { BlsStatusClient } from '../../bls-clients/interfaces/bls-status-client.interface';
import type { BlsClientResult, BlsClientTaskContext } from '../../bls-clients/types';
import { buildApplicantFormValues } from '../utils/build-applicant-form-values.util';

const ERROR_CODE = 'bls_status_pipeline';

/**
 * POC-stabilized defaults for portal-required invitation fields that the CRM
 * does not model yet (live-verified values for the seeded application's
 * visa-support documents). Per-application overrides: put the same keys into
 * `application.extras.portalHttpApplicantForm`.
 */
const APPLICANT_FORM_DEFAULTS: Record<string, string> = {
  IntendedDateOfArrival: '2026-12-20',
  InvitingContactName: 'MARTA',
  InvitingContactSurname: 'GARCIA',
  InvitingContactCity: 'MADRID',
  InvitingContactAddress: 'CALLE SERRANO 88',
  InvitingContactZipCode: '28006',
  InvitingContactEmail: 'marta.garcia@example.com',
  InvitingContactContactNo: '34600000000',
  InvitingAuthorityName: 'SPANISH CONSULATE',
  InvitingCity: 'MADRID',
  InvitingAddress: 'CALLE SERRANO 88',
  InvitingZipCode: '28006',
};

function addDaysIso(iso: string, days: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

function readApplicantFormOverrides(app: Application): Record<string, string> {
  const raw = (app.extras as Record<string, unknown> | null)?.portalHttpApplicantForm;
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) out[key] = value.trim();
  }
  return out;
}

@Injectable()
export class BlsStatusHttpClient implements BlsStatusClient {
  private readonly logger = new Logger(BlsStatusHttpClient.name);

  constructor(
    private readonly flow: PortalHttpFlowService,
    private readonly http: PortalHttpService,
    private readonly vault: BlsSecretVaultService,
    @InjectRepository(Application) private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, applicantId } = context;
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) return this.fail('Application not found');
    const applicant = (app.applicants || []).find((a) => a.id === applicantId) || (app.applicants || [])[0];
    if (!applicant) return this.fail('Applicant not found');
    const email = app.portalFormEmail?.trim();
    if (!email) return this.fail('portalFormEmail missing');
    let password: string;
    try {
      password = await this.vault.loadOrAdoptSecretPlain({
        workflowId,
        applicationId,
        purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
      }) ?? '';
    } catch {
      password = '';
    }
    if (!password) {
      return this.fail('Portal password not found in vault (per-workflow and application-wide)');
    }

    try {
      await this.flow.loginEnsureRotated(email, password, async (newPassword) => {
        await this.vault.persistSecret({
          workflowId, applicationId,
          purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
          plain: newPassword,
        });
      });
      let status = await this.readApplicantStatus(applicantId ?? applicant.id);
      if (!status) return this.fail('applicant row not found on myappointments');

      if (/Form Filling In-Progress/i.test(status.status)) {
        this.logger.log('applicant form incomplete — filling ManageApplicant (http)');
        const filled = await this.completeApplicantForm(app, applicant);
        if (!filled) return this.fail('applicant form completion failed (validation loop)');
        const recheck = await this.readApplicantStatus(applicantId ?? applicant.id);
        status = recheck ?? status;
      }
      if (!/Ready To Book Appointment/i.test(status.status)) {
        return this.fail(`applicant status is "${status.status}" (expected Ready To Book)`);
      }
      return { ok: true, verifiedExternalState: true };
    } catch (e) {
      return this.fail(e instanceof Error ? e.message : String(e));
    }
  }

  private async readApplicantStatus(applicantId: string): Promise<{ status: string; portalId: string | null } | null> {
    const page = await this.http.get('/Global/appointmentdata/myappointments');
    for (const rowHtml of page.text.matchAll(/<div class="row border p-3 rounded-3 mb-2[\s\S]*?<\/div>\s*<\/div>/gi)) {
      const text = rowHtml[0]!.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const portalId = rowHtml[0]!.match(/ManageApplicant\('([^']+)'/)?.[1] ?? null;
      const statusMatch = text.match(/(Form Filling In-Progress|Ready To Book Appointment)/i);
      // single-applicant rows for now (primary applicant)
      return { status: statusMatch ? statusMatch[1] : 'UNKNOWN', portalId };
    }
    return null;
  }

  private async completeApplicantForm(app: Application, applicant: NonNullable<Application['applicants']>[number]): Promise<boolean> {
    const editUrl = await this.flow.resolveApplicantEditUrl({ visaType: /schengen/i, location: /minsk/i });
    if (!editUrl) return false;
    return this.flow.fillApplicantForm(editUrl, buildApplicantFormValues(app, applicant));
  }

  private fail(message: string): BlsClientResult {
    this.logger.error(`status(http): ${message}`);
    return { ok: false, skipped: false, errorClass: 'SAFE_TO_REPEAT', errorCode: ERROR_CODE, errorMessage: message };
  }
}
