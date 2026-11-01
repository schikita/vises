/** Fail-closed Russian detail when PII key missing/invalid (503). */
export const PII_MSG_KEY_UNAVAILABLE =
  'Шифрование PII недоступно: не задан или некорректен VISES_PII_ENCRYPTION_KEY';

/** Safe Russian detail when decrypt fails (no plaintext in message). */
export const PII_MSG_DECRYPT_FAILED = 'Не удалось расшифровать PII';
