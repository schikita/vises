import {
  PORTAL_STATUS_EDIT_DIALOG_WAIT_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type {
  PortalEditSubmitDialogOutcome,
  RegisterPortalEditSubmitDialogListenerResult,
} from '../types/portal-edit-submit-dialog.types';
import type {
  PortalDialog,
  PortalDialogHandler,
  PortalPage,
} from '../types/patchright-surface.types';

type ListenerOptions = {
  /** Expected alert text (exact match after whitespace collapse). */
  expectedMessage?: string;
  /** Max wait for the dialog after Submit. */
  timeoutMs?: number;
};

const collapseDialogMessage = (raw: string): string =>
  raw.replace(/\s+/g, ' ').trim();

/**
 * Register a top-page `dialog` listener **before** Edit Submit (REQ-013).
 * Accepts only `Edited family member successfully.`; other dialogs are dismissed.
 */
export const registerPortalEditSubmitDialogListener = (
  page: PortalPage,
  options?: ListenerOptions,
): RegisterPortalEditSubmitDialogListenerResult => {
  const expected = collapseDialogMessage(
    options?.expectedMessage ??
      PORTAL_STATUS_SELECTORS.editSuccessDialogMessage,
  );
  const timeoutMs = options?.timeoutMs ?? PORTAL_STATUS_EDIT_DIALOG_WAIT_MS;

  let disposed = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let handlerRef: PortalDialogHandler | undefined;

  const detach = (): void => {
    if (disposed) {
      return;
    }
    disposed = true;
    if (settleTimer !== undefined) {
      clearTimeout(settleTimer);
      settleTimer = undefined;
    }
    if (!handlerRef) {
      return;
    }
    if (typeof page.off === 'function') {
      page.off('dialog', handlerRef);
      return;
    }
    if (typeof page.removeListener === 'function') {
      page.removeListener('dialog', handlerRef);
    }
  };

  if (typeof page.on !== 'function' && typeof page.once !== 'function') {
    return {
      outcome: Promise.resolve({
        accepted: false,
        timedOut: true,
        listenerUnavailable: true,
      }),
      dispose: detach,
    };
  }

  const outcome = new Promise<PortalEditSubmitDialogOutcome>((resolve) => {
    const finish = (result: PortalEditSubmitDialogOutcome): void => {
      detach();
      resolve(result);
    };

    handlerRef = (dialog: PortalDialog): void => {
      void (async (): Promise<void> => {
        const message = collapseDialogMessage(dialog.message());
        const isSuccess = message === expected;
        try {
          if (isSuccess) {
            await dialog.accept();
            finish({
              accepted: true,
              message: message.slice(0, 160),
              timedOut: false,
            });
            return;
          }
          await dialog.dismiss();
        } catch {
          try {
            await dialog.accept();
          } catch {
            // Dialog may already be closed by navigation.
          }
          // Message matched even if accept/dismiss threw (e.g. nav race).
          finish({
            accepted: isSuccess,
            message: message.slice(0, 160),
            timedOut: false,
          });
          return;
        }
        finish({
          accepted: false,
          message: message.slice(0, 160),
          timedOut: false,
        });
      })();
    };

    if (typeof page.on === 'function') {
      page.on('dialog', handlerRef);
    } else if (typeof page.once === 'function') {
      page.once('dialog', handlerRef);
    }

    settleTimer = setTimeout(() => {
      finish({ accepted: false, timedOut: true });
    }, timeoutMs);
  });

  return { outcome, dispose: detach };
};
