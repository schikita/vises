/**
 * Narrow Proxy6 lease runtime config (SUB-005.1 / REQ-022).
 * Portal AutofillConfig remains the aggregator and is structurally compatible.
 * Field names are capability-oriented (abstract-external-service-args DEC-007);
 * type name stays Proxy6-specific (vendor lease module).
 */

export type Proxy6ProxyRuntimeConfig = {
  /**
   * Effective portal proxying: non-empty trimmed PROXY6_API_KEY
   * (DEC-002; no settings toggle).
   */
  proxyEnabled: boolean;
  /**
   * Legacy misconfig signal (enabled-without-key). Under env-only enablement
   * this stays false; missing key ⇒ proxyEnabled false.
   */
  proxyMisconfigured: boolean;
  proxyProviderApiKey?: string;
};
