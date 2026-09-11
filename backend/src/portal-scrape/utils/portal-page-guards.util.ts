/// <reference lib="dom" />
import type { PortalPage } from '../types';

export async function detectBlockingPage(
  page: PortalPage,
): Promise<string | undefined> {
  const clues = await page.evaluate(() => {
    const bodyText = (document.body?.innerText ?? '').toLowerCase();
    const hasCaptcha =
      Boolean(
        document.querySelector('[class*="captcha" i], [id*="captcha" i]'),
      ) || bodyText.includes('captcha');
    const hasLogin =
      Boolean(
        document.querySelector(
          'input[type="password"], form[action*="Login" i], #loginForm',
        ),
      ) && !document.querySelector('#myForm');
    return { hasCaptcha, hasLogin };
  });
  if (clues.hasCaptcha) {
    return 'CAPTCHA / anti-bot challenge detected — stop (CON-007); no bypass attempted';
  }
  if (clues.hasLogin) {
    return 'Auth required: login wall before RegisterUser (OQ-2); credentials not invented';
  }
  return undefined;
}

export async function readCountryCode(
  page: PortalPage,
): Promise<string | undefined> {
  return page.evaluate(() => {
    const el = document.querySelector(
      'input[name="CountryCode"]',
    ) as HTMLInputElement | null;
    return el?.value;
  });
}

export async function assertMyForm(page: PortalPage): Promise<void> {
  const present = await page.locator('#myForm').count();
  if (present === 0) {
    const diagnostics = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form')).map((f) => ({
        id: f.id || null,
        action: f.getAttribute('action'),
        name: f.getAttribute('name'),
      }));
      return {
        title: document.title,
        url: location.href,
        forms,
        hasBtnVerify: Boolean(document.querySelector('#btnVerify')),
      };
    });
    throw new Error(
      `#myForm not found — fail fast. diagnostics=${JSON.stringify(diagnostics)}`,
    );
  }
}
