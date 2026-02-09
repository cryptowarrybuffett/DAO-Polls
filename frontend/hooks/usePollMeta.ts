"use client";

import { useState, useEffect, useCallback } from "react";
import type { PollOffchainMeta } from "@/lib/types";
import { getPollMeta, setPollMeta } from "@/lib/storage";

export function usePollMeta(pollId: number) {
  const [meta, setMeta] = useState<PollOffchainMeta | null>(null);

  useEffect(() => {
    setMeta(getPollMeta(pollId));
  }, [pollId]);

  const saveMeta = useCallback(
    (newMeta: PollOffchainMeta) => {
      setPollMeta(pollId, newMeta);
      setMeta(newMeta);
    },
    [pollId]
  );

  return { meta, saveMeta };
}
