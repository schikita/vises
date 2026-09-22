/**
 * Narrow Proxy6 lease runtime config (SUB-005.1 / REQ-022).
 * Portal AutofillConfig remains the aggregator and is structurally compatible.
 */

export type Proxy6ProxyRuntimeConfig = {
  /**
   * Effective Proxy6 portal proxying: non-empty trimmed PROXY6_API_KEY
   * (DEC-002; no settings toggle).
   */
  proxy6Enabled: boolean;
  /**
   * Legacy misconfig signal (enabled-without-key). Under env-only enablement
   * this stays false; missing key ⇒ proxy6Enabled false.
   */
  proxy6Misconfigured: boolean;
  proxy6ApiKey?: string;
};
