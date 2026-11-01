/**
 * Render API percentage decimal string as-is (AC-12 / AC-12a / FR-9.3).
 * Do not parseFloat or re-round — only append the percent sign.
 */
export const formatAnalyticsPercentageDisplay = (
  percentage: string,
): string => `${percentage}%`
