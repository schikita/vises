/**
 * Browserless 3x3 captcha solver: static widget parse (CSS cascade) +
 * in-process JS inference (BlsNetEngine, int8 CNN — no Python/torch).
 * Quality gate "don't guess": any tile below MIN_CONF -> reload the challenge
 * when possible, otherwise fail so the caller restarts the stage without
 * wasting a captcha submission.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { parseCaptchaWidget } from './utils/portal-html.util';
import { BlsNetEngine } from './captcha/bls-net.engine';
import { decodeTile, tileToTensor } from './captcha/tile-decode.util';

const MIN_CONF = 0.9;
const MAX_TRIES = 5;

export type CaptchaSolveInput = {
  html: string;
  /** Re-fetch the challenge page (register iframe only; login pages are one-shot). */
  fetchChallenge?: () => Promise<string>;
};

@Injectable()
export class PortalHttpCaptchaService implements OnModuleInit {
  /**
   * Sliding captcha-submission budget: the portal rejects captcha submissions
   * well below our attempt cadence (~3/hour per account per POC notes; a
   * login chain burns 2). Beyond the window we refuse to solve/submit at all
   * so the task parks in WAITING_STAFF instead of churning rejections.
   */
  private static readonly BUDGET_PER_HOUR = 8;
  private readonly submissions: number[] = [];
  private readonly logger = new Logger(PortalHttpCaptchaService.name);
  private readonly engine = new BlsNetEngine();

  onModuleInit(): void {
    const t = this.engine.selfTest();
    if (!t.ok) {
      this.logger.error(`captcha engine self-test FAILED (${t.pass}/${t.total})`);
      throw new Error('bls captcha engine self-test failed');
    }
    this.logger.log(`captcha engine ready (self-test ${t.pass}/${t.total})`);
  }

  async solve(input: CaptchaSolveInput): Promise<{ picks: string[]; target: string }> {
    const now = Date.now();
    while (this.submissions.length && now - this.submissions[0]! > 3_600_000) {
      this.submissions.shift();
    }
    if (this.submissions.length >= PortalHttpCaptchaService.BUDGET_PER_HOUR) {
      throw new Error(
        `captcha budget exhausted (${this.submissions.length}/hour) — wait for the portal window to reset`,
      );
    }
    this.submissions.push(now);
    let html = input.html;
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      const parsed = parseCaptchaWidget(html);
      if (parsed.cells.size !== 9 || !parsed.instr) {
        throw new Error(`captcha parse failed (cells=${parsed.cells.size})`);
      }
      const grid = [...parsed.cells.values()].sort((a, b) => a.top - b.top || a.left - b.left);
      const target = parsed.instr.target;
      const picks: string[] = [];
      let pickConf = 1;
      let anyConf = 1;
      for (const tile of grid) {
        const img = decodeTile(Buffer.from(tile.b64, 'base64'));
        const pred = this.engine.predict(tileToTensor(img, this.engine.w, this.engine.h));
        anyConf = Math.min(anyConf, pred.conf);
        if (pred.num === Number(target)) {
          picks.push(tile.id);
          pickConf = Math.min(pickConf, pred.conf);
        }
      }
      this.logger.log(
        `captcha target=${target} picks=${picks.length} pickConf=${pickConf.toFixed(3)} anyConf=${anyConf.toFixed(3)}`,
      );
      if (picks.length === 0) throw new Error('captcha solver found no picks');
      // Gate on PICKED tiles only: unpicked tiles' ambiguity is irrelevant
      // (we never submit them). anyConf stays in the log for diagnostics;
      // an extreme low value (< 0.2) flags a likely misparsed challenge.
      const misparsed = anyConf < 0.2;
      if ((pickConf < MIN_CONF || misparsed) && input.fetchChallenge && attempt < MAX_TRIES) {
        this.logger.warn('low confidence — reloading challenge instead of submitting');
        html = await input.fetchChallenge();
        continue;
      }
      if (pickConf < MIN_CONF) {
        throw new Error(`captcha_low_confidence (pick=${pickConf.toFixed(2)} any=${anyConf.toFixed(2)})`);
      }
      return { picks, target };
    }
    throw new Error('captcha quality gate exhausted');
  }
}
