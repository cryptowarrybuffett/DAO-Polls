"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePolls } from "@/hooks/usePolls";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { usePausePoll, useUnpausePoll } from "@/hooks/useAdminActions";
import { getHiddenPolls, toggleHiddenPoll } from "@/lib/storage";
import { isPollActive, truncateAddress, formatTimeRemaining } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TransactionStatus } from "@/components/TransactionStatus";

function AdminPollRow({ poll, hiddenPolls, onToggleHidden }: {
  poll: { id: number; title: string; creator: string; endTime: number; isPaused: boolean; yesVotes: bigint; noVotes: bigint };
  hiddenPolls: number[];
  onToggleHidden: (id: number) => void;
}) {
  const active = isPollActive(poll.endTime);
  const isHidden = hiddenPolls.includes(poll.id);
  const totalVotes = Number(poll.yesVotes) + Number(poll.noVotes);

  const {
    pausePoll,
    isPending: isPausePending,
    isConfirming: isPauseConfirming,
    isSuccess: isPauseSuccess,
    error: pauseError,
    txHash: pauseTxHash,
    reset: resetPause,
  } = usePausePoll();

  const {
    unpausePoll,
    isPending: isUnpausePending,
    isConfirming: isUnpauseConfirming,
    isSuccess: isUnpauseSuccess,
    error: unpauseError,
    txHash: unpauseTxHash,
    reset: resetUnpause,
  } = useUnpausePoll();

  const isPending = isPausePending || isUnpausePending;
  const isConfirming = isPauseConfirming || isUnpauseConfirming;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/poll/${poll.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            #{poll.id} — {poll.title}
          </Link>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-text-secondary">
            <span>by {truncateAddress(poll.creator)}</span>
            <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
            <span>{formatTimeRemaining(poll.endTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {poll.isPaused && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
              Paused
            </span>
          )}
          {isHidden && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-danger/20 text-danger">
              Hidden
            </span>
          )}
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              active ? "bg-success/20 text-success" : "bg-text-secondary/20 text-text-secondary"
            }`}
          >
            {active ? "Active" : "Ended"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* On-chain pause/unpause */}
        {poll.isPaused ? (
          <button
            onClick={() => { resetUnpause(); unpausePoll(poll.id); }}
            disabled={isPending || isConfirming}
            className="px-3 py-1.5 text-xs rounded-lg font-medium bg-success/20 text-success hover:bg-success/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Unpause (on-chain)
          </button>
        ) : (
          <button
            onClick={() => { resetPause(); pausePoll(poll.id); }}
            disabled={isPending || isConfirming}
            className="px-3 py-1.5 text-xs rounded-lg font-medium bg-warning/20 text-warning hover:bg-warning/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Pause (on-chain)
          </button>
        )}

        {/* Off-chain hide/unhide */}
        <button
          onClick={() => onToggleHidden(poll.id)}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
            isHidden
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-danger/20 text-danger hover:bg-danger/30"
          }`}
        >
          {isHidden ? "Unhide (off-chain)" : "Hide (off-chain)"}
        </button>
      </div>

      {/* Transaction status */}
      {(pauseTxHash || pauseError) && (
        <TransactionStatus
          isPending={isPausePending}
          isConfirming={isPauseConfirming}
          isSuccess={isPauseSuccess}
          error={pauseError}
          txHash={pauseTxHash}
        />
      )}
      {(unpauseTxHash || unpauseError) && (
        <TransactionStatus
          isPending={isUnpausePending}
          isConfirming={isUnpauseConfirming}
          isSuccess={isUnpauseSuccess}
          error={unpauseError}
          txHash={unpauseTxHash}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const isAdmin = useIsAdmin();
  const { polls, isLoading } = usePolls();
  const [hiddenPolls, setHiddenPolls] = useState<number[]>([]);

  useEffect(() => {
    setHiddenPolls(getHiddenPolls());
  }, []);

  const handleToggleHidden = useCallback((pollId: number) => {
    const updated = toggleHiddenPoll(pollId);
    setHiddenPolls([...updated]);
  }, []);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-foreground mb-3">Access Denied</h1>
        <p className="text-text-secondary mb-6">
          Your wallet is not authorized to access the admin panel.
        </p>
        <Link href="/" className="text-primary hover:text-primary-hover transition-colors">
          Back to polls
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const sortedPolls = [...polls].reverse();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage polls: pause/unpause (on-chain) or hide/unhide (off-chain).
        </p>
      </div>

      <div className="bg-surface/50 border border-border rounded-2xl p-4 text-xs text-text-secondary space-y-1">
        <p><strong className="text-foreground">On-chain pause:</strong> Prevents voting via smart contract. Requires contract owner wallet.</p>
        <p><strong className="text-foreground">Off-chain hide:</strong> Hides poll from public list (localStorage). Admin can still see hidden polls.</p>
      </div>

      {sortedPolls.length === 0 ? (
        <p className="text-text-secondary text-center py-10">No polls to manage.</p>
      ) : (
        <div className="space-y-4">
          {sortedPolls.map((poll) => (
            <AdminPollRow
              key={poll.id}
              poll={poll}
              hiddenPolls={hiddenPolls}
              onToggleHidden={handleToggleHidden}
            />
          ))}
        </div>
      )}
    </div>
  );
}
