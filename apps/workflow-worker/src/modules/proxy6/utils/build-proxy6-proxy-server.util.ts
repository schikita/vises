/** Build Playwright/Patchright proxy server URL (DEC-006: http://host:port). */
export const buildProxy6ProxyServer = (host: string, port: number): string =>
  `http://${host}:${port}`;
