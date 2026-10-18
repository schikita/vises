/**
 * Minimal hand-written Patchright surfaces (DEC-006).
 * Avoids eager `import('patchright')` / `import type` from the package so API
 * boot never loads browser binaries (CON-006 / DEC-010).
 * Runtime values from lazy `await import('patchright')` are narrowed to these.
 */

export type PortalLocator = {
  count(): Promise<number>;
  first(): PortalLocator;
  fill(value: string): Promise<void>;
  inputValue(): Promise<string>;
  click(options?: { timeout?: number }): Promise<void>;
  pressSequentially(
    text: string,
    options?: { delay?: number },
  ): Promise<void>;
  isVisible(): Promise<boolean>;
  isDisabled(): Promise<boolean>;
};

/** Frame (or page) surface used for CAPTCHA extract/apply inside an iframe. */
export type PortalFrame = {
  url(): string;
  evaluate<R>(pageFunction: () => R | Promise<R>): Promise<R>;
  evaluate<R, Arg>(
    pageFunction: (arg: Arg) => R | Promise<R>,
    arg: Arg,
  ): Promise<R>;
  waitForSelector(
    selector: string,
    options?: { state?: string; timeout?: number },
  ): Promise<unknown>;
};

export type PortalPage = {
  evaluate<R>(pageFunction: () => R | Promise<R>): Promise<R>;
  evaluate<R, Arg>(
    pageFunction: (arg: Arg) => R | Promise<R>,
    arg: Arg,
  ): Promise<R>;
  locator(selector: string): PortalLocator;
  /** All frames (main + iframes); used to enter GenerateCaptcha. */
  frames(): PortalFrame[];
  setDefaultTimeout(timeout: number): void;
  setDefaultNavigationTimeout(timeout: number): void;
  goto(
    url: string,
    options?: { waitUntil?: string; timeout?: number },
  ): Promise<unknown>;
  waitForSelector(
    selector: string,
    options?: { state?: string; timeout?: number },
  ): Promise<unknown>;
  /**
   * Load-state wait (Patchright page API). Used after navigating Verify clicks
   * before the next `evaluate` (portal-login-prep-nav-race DEC-007 / NFR-004).
   */
  waitForLoadState?(
    state?: string,
    options?: { timeout?: number },
  ): Promise<unknown>;
  waitForFunction(
    pageFunction: () => boolean,
    options?: { timeout?: number },
  ): Promise<unknown>;
  waitForFunction<Arg>(
    pageFunction: (arg: Arg) => boolean,
    arg: Arg,
    options?: { timeout?: number },
  ): Promise<unknown>;
  screenshot(options?: {
    path?: string;
    fullPage?: boolean;
  }): Promise<unknown>;
};

export type PortalBrowserContext = {
  newPage(): Promise<PortalPage>;
  close(): Promise<void>;
};

export type PortalBrowser = {
  newContext(options?: {
    proxy?: {
      server: string;
      username?: string;
      password?: string;
    };
  }): Promise<PortalBrowserContext>;
  close(): Promise<void>;
};

export type PortalChromium = {
  launch(options?: {
    headless?: boolean;
    channel?: string;
    timeout?: number;
  }): Promise<PortalBrowser>;
};

/** Narrow surface of the lazily imported patchright module. */
export type PortalPatchrightModule = {
  chromium: PortalChromium;
};
