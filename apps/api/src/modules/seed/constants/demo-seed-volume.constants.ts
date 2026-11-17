/** Deterministic RNG seed for FR-11 passport / contact / volume variation. */
export const SEED_RNG_SEED = 20_250_920;

/** Amended FR-11 / AC-19: exactly 20 generated agents. */
export const SEED_AGENT_COUNT = 20;

/** Inclusive per-agent client count bounds. */
export const SEED_CLIENTS_PER_AGENT_MIN = 2;
export const SEED_CLIENTS_PER_AGENT_MAX = 50;

/**
 * Extra unused balance slots after seeded client debits: random in [0, max].
 * Remaining balance = extraSlots * price_per_client.
 */
export const SEED_EXTRA_BALANCE_SLOTS_MAX = 5;
