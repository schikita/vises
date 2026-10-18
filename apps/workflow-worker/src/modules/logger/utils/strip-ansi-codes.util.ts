/** Strip ANSI escape sequences from a string (e.g. pre-colored Winston levels). */
export const stripAnsiCodes = (value: string): string =>
  value.replace(/\u001b\[[0-9;]*m/g, '');
