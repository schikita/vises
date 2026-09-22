/**
 * Staff-facing failure text: drop Playwright “Call log” noise and map
 * common navigation timeouts to a short Russian line.
 */
export const formatPortalAutofillFailureReason = (reason: string): string => {
  const compact =
    reason.split(/Call log:/i)[0]?.trim().replace(/\s+/g, ' ') ?? reason.trim()

  const timeoutMs = /page\.goto:\s*Timeout\s+(\d+)ms\s+exceeded/i.exec(compact)
  if (timeoutMs) {
    const seconds = Math.round(Number(timeoutMs[1]) / 1000)
    const url = /navigating to "([^"]+)"/i.exec(reason)?.[1]
    return url
      ? `Не удалось открыть страницу портала за ${seconds} с: ${url}`
      : `Не удалось открыть страницу портала за ${seconds} с`
  }

  return compact.replace(/^navigation failed:\s*/i, '')
}
