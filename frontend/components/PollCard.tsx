"use client";

import Link from "next/link";
import { truncateAddress, formatTimeRemaining, isPollActive } from "@/lib/utils";
import { usePollMeta } from "@/hooks/usePollMeta";
import type { PollData } from "@/hooks/usePolls";

export function PollCard({ poll }: { poll: PollData }) {
  const active = isPollActive(poll.endTime);
  const totalVotes = Number(poll.yesVotes) + Number(poll.noVotes);
  const { meta } = usePollMeta(poll.id);

  return (
    <Link href={`/poll/${poll.id}`}>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:bg-surface-hover transition-all cursor-pointer shadow-lg shadow-black/20 card-glow">
        {meta?.imageUrl && (
          <div className="relative w-full h-40">
            <img
              src={meta.imageUrl}
              alt={poll.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="font-semibold text-foreground line-clamp-2">{poll.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {meta?.requiresTwitter && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                  X
                </span>
              )}
              {poll.isPaused && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                  Paused
                </span>
              )}
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  active
                    ? "bg-success/20 text-success"
                    : "bg-text-secondary/20 text-text-secondary"
                }`}
              >
                {active ? "Active" : "Ended"}
              </span>
            </div>
          </div>

          <p className="text-text-secondary text-sm line-clamp-2 mb-4">
            {poll.description || "No description"}
          </p>

          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>by {truncateAddress(poll.creator)}</span>
            <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
            <span>{formatTimeRemaining(poll.endTime)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
