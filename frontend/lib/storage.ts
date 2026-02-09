import type { PollOffchainMeta } from "./types";

const POLL_META_PREFIX = "poll_meta_";

export function getPollMeta(pollId: number): PollOffchainMeta | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${POLL_META_PREFIX}${pollId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PollOffchainMeta;
  } catch {
    return null;
  }
}

export function setPollMeta(pollId: number, meta: PollOffchainMeta): void {
  localStorage.setItem(`${POLL_META_PREFIX}${pollId}`, JSON.stringify(meta));
}

// ---------------------------------------------------------------------------
// Hidden polls (admin moderation - off-chain)
// ---------------------------------------------------------------------------

const HIDDEN_POLLS_KEY = "hidden_polls";

export function getHiddenPolls(): number[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HIDDEN_POLLS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export function toggleHiddenPoll(pollId: number): number[] {
  const hidden = getHiddenPolls();
  const index = hidden.indexOf(pollId);
  if (index === -1) {
    hidden.push(pollId);
  } else {
    hidden.splice(index, 1);
  }
  localStorage.setItem(HIDDEN_POLLS_KEY, JSON.stringify(hidden));
  return hidden;
}

export function isPollHidden(pollId: number): boolean {
  return getHiddenPolls().includes(pollId);
}
