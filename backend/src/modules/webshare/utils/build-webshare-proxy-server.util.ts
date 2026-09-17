/** Build Playwright/Patchright proxy server URL for Webshare direct mode. */
export const buildWebshareProxyServer = (
  proxyAddress: string,
  port: number,
): string => `http://${proxyAddress}:${port}`;
