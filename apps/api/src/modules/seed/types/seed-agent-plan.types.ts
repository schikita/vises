import type { ApplicationStatus } from '@vises/contracts';

/** Deterministic per-agent FR-11 seed plan (users + apps + ledger). */
export type SeedAgentPlan = {
  /** 1-based agent index in `1..SEED_AGENT_COUNT`. */
  index: number;
  /** Zero-padded ordinal used in ids / logins / row prefixes (`01` … `20`). */
  ordinal: string;
  userId: string;
  name: string;
  login: string;
  inviteToken: string;
  clientCount: number;
  extraSlots: number;
  balanceSlots: number;
  topUpAmountWhole: number;
  finalBalanceWhole: number;
  statuses: readonly ApplicationStatus[];
  /** Offset added to {@link SEED_RNG_SEED} for per-agent passport RNG. */
  rngSeedOffset: number;
};
