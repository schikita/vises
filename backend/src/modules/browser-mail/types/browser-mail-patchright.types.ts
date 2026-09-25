/**
 * Minimal Patchright surfaces for browser mail adapter (DEC-012 / CON-006).
 * Hand-written — no eager `import('patchright')` / `import type` from package.
 */

export type BrowserMailLocator = {
  count(): Promise<number>;
  first(): BrowserMailLocator;
  nth(index: number): BrowserMailLocator;
  fill(value: string): Promise<void>;
  click(options?: { timeout?: number }): Promise<void>;
  textContent(): Promise<string | null>;
  inputValue(): Promise<string>;
};

export type BrowserMailPage = {
  locator(selector: string): BrowserMailLocator;
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
  evaluate<R>(pageFunction: () => R | Promise<R>): Promise<R>;
  evaluate<R, Arg>(
    pageFunction: (arg: Arg) => R | Promise<R>,
    arg: Arg,
  ): Promise<R>;
};

export type BrowserMailBrowserContext = {
  newPage(): Promise<BrowserMailPage>;
  close(): Promise<void>;
};

export type BrowserMailBrowser = {
  newContext(): Promise<BrowserMailBrowserContext>;
  close(): Promise<void>;
};

export type BrowserMailChromium = {
  launch(options?: {
    headless?: boolean;
    channel?: string;
  }): Promise<BrowserMailBrowser>;
};

export type BrowserMailPatchrightModule = {
  chromium: BrowserMailChromium;
};
