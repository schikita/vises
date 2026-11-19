/** Keep digits only, including a leading country code. */
export const digitsOnlyPhone = (value: string): string => value.replace(/\D/g, '')
