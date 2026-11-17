/**
 * Render API percentage decimal string as-is (FR-15).
 * Do not parseFloat or re-round — only append the percent sign.
 */
export const formatAnalyticsPercentageDisplay = (percentage: string): string =>
  `${percentage}%`
