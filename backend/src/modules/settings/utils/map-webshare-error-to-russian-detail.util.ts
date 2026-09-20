import { isWebshareProxyError } from '../../webshare';

/** Safe Russian detail for Webshare admin API failures (DEC-003 / NFR-003). */
export const mapWebshareErrorToRussianDetail = (err: unknown): string => {
  if (isWebshareProxyError(err) && err.message.trim().length > 0) {
    return err.message;
  }
  return 'Не удалось обновить список прокси Webshare';
};
