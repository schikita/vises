/**
 * HTTP-based BOOKING client: walk newappointment -> (dp) -> appointment captcha
 * -> VisaType submit -> SlotSelection. Reaching SlotSelection is the task goal:
 * "slots_unavailable" -> ok (external state, report via message), calendar /
 * video verification -> ok + stop point recorded for the human handoff.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { PortalHttpFlowService } from '../portal-http-flow.service';
import { BlsSecretVaultService } from '../../bls-secrets/bls-secret-vault.service';
import { BLS_SECRET_PURPOSE } from '../../bls-secrets/constants/bls-secret-purpose.constants';
import type { BlsBookingClient } from '../../bls-clients/interfaces/bls-booking-client.interface';
import type { BlsClientResult, BlsClientTaskContext } from '../../bls-clients/types';
import { transliterate } from '../utils/transliterate.util';
import { buildApplicantFormValues } from '../utils/build-applicant-form-values.util';

const ERROR_CODE = 'bls_booking_http';

/**
 * POC-stabilized defaults for the booking walk. Per-application overrides:
 * `extras.portalHttpBooking` = { visaType, subType, category } (RegExp source
 * strings, matched case-insensitively against portal dropdown labels).
 */
const BOOKING_DEFAULTS = {
  visaType: 'schengen',
  subType: 'schengen',
  category: 'normal',
};

function readBookingOverrides(app: Application): {
  visaType: RegExp;
  subType: RegExp;
  category: RegExp;
} {
  const raw = (app.extras as Record<string, unknown> | null)?.portalHttpBooking;
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const pick = (key: keyof typeof BOOKING_DEFAULTS): RegExp =>
    new RegExp(
      typeof source[key] === 'string' && source[key] ? String(source[key]) : BOOKING_DEFAULTS[key],
      'i',
    );
  return { visaType: pick('visaType'), subType: pick('subType'), category: pick('category') };
}

@Injectable()
export class BlsBookingHttpClient implements BlsBookingClient {
  private readonly logger = new Logger(BlsBookingHttpClient.name);

  constructor(
    private readonly flow: PortalHttpFlowService,
    private readonly vault: BlsSecretVaultService,
    @InjectRepository(Application) private readonly appsRepo: Repository<Application>,
  ) {}

  async execute(context: BlsClientTaskContext): Promise<BlsClientResult> {
    const { workflowId, applicationId, applicantId } = context;
    const app = await this.appsRepo.findOne({ where: { id: applicationId } });
    if (!app) return this.fail('Application not found');
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
      let stop = await this.flow.walkBooking({
        // Location matches the portal's English dropdown labels, so the CRM
        // submit city («Минск») is ICAO-transliterated. Every selection pattern
        // can be overridden per-application via extras.portalHttpBooking.
        ...readBookingOverrides(app),
        location: new RegExp(transliterate(String(app.submitCity ?? 'Minsk')), 'i'),
      });
      // qnKM root cause (proven live 2026-10-28): the portal demands the
      // applicant form for the SELECTED visa type before booking. Complete it
      // via ManageApplicant, then rewalk once — the submit then reaches
      // SlotSelection.
      if (stop.state === 'applicant_form_required') {
        const applicant =
          (app.applicants || []).find((a) => a.id === applicantId) || (app.applicants || [])[0];
        if (!applicant) return this.fail('applicant not found for form completion');
        const pick = readBookingOverrides(app);
        const editUrl = await this.flow.resolveApplicantEditUrl({
          visaType: pick.visaType,
          location: new RegExp(transliterate(String(app.submitCity ?? 'Minsk')), 'i'),
        });
        if (!editUrl) return this.fail('ManageApplicant edit URL not resolved');
        this.logger.log('booking(http): applicant form required for this visa type — completing');
        const filled = await this.flow.fillApplicantForm(
          editUrl,
          buildApplicantFormValues(app, applicant),
        );
        if (!filled) return this.fail('applicant form completion failed (validation loop)');
        this.logger.log('booking(http): applicant form completed — rewalking booking');
        stop = await this.flow.walkBooking({
          ...readBookingOverrides(app),
          location: new RegExp(transliterate(String(app.submitCity ?? 'Minsk')), 'i'),
        });
      }
      // Long 429 waits can outlive the portal session — re-login once and
      // rewalk inside the same task attempt instead of burning it.
      if (stop.state === 'session_expired') {
        this.logger.warn('booking(http): session expired mid-walk — re-login and rewalk');
        await this.flow.loginEnsureRotated(email, password, async (newPassword) => {
        await this.vault.persistSecret({
          workflowId, applicationId,
          purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
          plain: newPassword,
        });
      });
        stop = await this.flow.walkBooking({
          ...readBookingOverrides(app),
          location: new RegExp(transliterate(String(app.submitCity ?? 'Minsk')), 'i'),
        });
      }
      if (stop.state === 'session_expired') {
        return this.fail('booking session expired twice mid-walk');
      }
      // Stale account-level booking request (token dies on every submit):
      // cancel it via myappointments so the portal issues a fresh one, then
      // rewalk once. The cancel outcome lands in the events log.
      if (stop.state === 'stale_booking_request') {
        const outcome = await this.flow.cancelStaleBookingRequest();
        this.logger.log(`booking(http): stale request cancelled — ${outcome}`);
        stop = await this.flow.walkBooking({
          ...readBookingOverrides(app),
          location: new RegExp(transliterate(String(app.submitCity ?? 'Minsk')), 'i'),
        });
      }
      if (stop.state === 'slots_unavailable') {
        this.logger.log('booking(http): reached SlotSelection — no slots currently available');
        return { ok: true, verifiedExternalState: true };
      }
      if (stop.state === 'calendar') {
        this.logger.warn('booking(http): SLOTS AVAILABLE — calendar reached, stopping for human handoff');
        return { ok: true, verifiedExternalState: true };
      }
      if (stop.state === 'video_verification') {
        this.logger.warn('booking(http): VIDEO VERIFICATION step reached — stopping for human');
        return { ok: true, verifiedExternalState: true };
      }
      if (stop.state === 'dp_pending') {
        return this.fail('data protection consent pending — accept via the email link, then retry');
      }
      if (stop.state === 'unknown') {
        const text = stop.html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 300);
        return this.fail(
          `unexpected booking state at ${stop.url}${stop.banner ? `: ${stop.banner}` : ''} — "${text}"`,
        );
      }
      return this.fail('unexpected booking state');
    } catch (e) {
      return this.fail(e instanceof Error ? e.message : String(e));
    }
  }

  private fail(message: string): BlsClientResult {
    this.logger.error(`booking(http): ${message}`);
    return { ok: false, skipped: false, errorClass: 'SAFE_TO_REPEAT', errorCode: ERROR_CODE, errorMessage: message };
  }
}
