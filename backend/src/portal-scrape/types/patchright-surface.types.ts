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
};

export type PortalPage = {
  evaluate<R>(pageFunction: () => R | Promise<R>): Promise<R>;
  evaluate<R, Arg>(
    pageFunction: (arg: Arg) => R | Promise<R>,
    arg: Arg,
  ): Promise<R>;
  locator(selector: string): PortalLocator;
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
  waitForFunction(
    pageFunction: () => boolean,
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
  newContext(): Promise<PortalBrowserContext>;
  close(): Promise<void>;
};

export type PortalChromium = {
  launch(options?: {
    headless?: boolean;
    channel?: string;
  }): Promise<PortalBrowser>;
};

/** Narrow surface of the lazily imported patchright module. */
export type PortalPatchrightModule = {
  chromium: PortalChromium;
};
