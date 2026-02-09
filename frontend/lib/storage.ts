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
