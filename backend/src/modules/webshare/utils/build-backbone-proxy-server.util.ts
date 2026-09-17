import { WEBSHARE_PROXY_BACKBONE_HOST } from '../constants/webshare-proxy.constants';

/** Build Patchright proxy server URL for Webshare backbone mode (DEC-008). */
export const buildBackboneProxyServer = (port: number): string =>
  `http://${WEBSHARE_PROXY_BACKBONE_HOST}:${port}`;
