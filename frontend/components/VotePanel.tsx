"use client";

import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useVote } from "@/hooks/useVote";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import { usePollMeta } from "@/hooks/usePollMeta";
import { TransactionStatus } from "./TransactionStatus";
import { TwitterConnect } from "./TwitterConnect";
import { isPollActive } from "@/lib/utils";
import { useEffect } from "react";

interface VotePanelProps {
  pollId: number;
  endTime: number;
  isPaused: boolean;
  userVoted: boolean;
  userChoice: boolean;
  onVoteSuccess: () => void;
}

export function VotePanel({
  pollId,
  endTime,
  isPaused,
  userVoted,
  userChoice,
  onVoteSuccess,
}: VotePanelProps) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork } = useNetworkCheck();
  const { vote, isPending, isConfirming, isSuccess, error, txHash, reset } = useVote();
  const { meta } = usePollMeta(pollId);
  const { data: session } = useSession();

  const active = isPollActive(endTime);
  const requiresTwitter = meta?.requiresTwitter ?? false;
  const hasTwitter = !!session?.twitterHandle;
  const twitterBlocked = requiresTwitter && !hasTwitter;

  useEffect(() => {
    if (isSuccess) {
      onVoteSuccess();
    }
  }, [isSuccess, onVoteSuccess]);

  if (!isConnected) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-text-secondary">Connect your wallet to vote</p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-danger">Switch to Base network to vote</p>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-text-secondary">This poll has ended</p>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-warning">This poll has been paused by an admin</p>
      </div>
    );
  }

  if (userVoted) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-text-secondary">
          You voted{" "}
          <span className={userChoice ? "text-success font-semibold" : "text-danger font-semibold"}>
            {userChoice ? "Yes" : "No"}
          </span>
        </p>
      </div>
    );
  }

  if (twitterBlocked) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 text-center shadow-lg shadow-black/20">
        <p className="text-sm text-text-secondary">
          This poll requires a Twitter (X) account to vote
        </p>
        <TwitterConnect />
      </div>
    );
  }

  const disabled = isPending || isConfirming;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-lg shadow-black/20">
      <p className="text-sm text-text-secondary text-center">Cast your vote</p>
      <div className="flex gap-3">
        <button
          onClick={() => { reset(); vote(pollId, true); }}
          disabled={disabled}
          className="flex-1 py-3 rounded-xl font-semibold text-white bg-success hover:bg-success/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Vote Yes
        </button>
        <button
          onClick={() => { reset(); vote(pollId, false); }}
          disabled={disabled}
          className="flex-1 py-3 rounded-xl font-semibold text-white bg-danger hover:bg-danger/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Vote No
        </button>
      </div>
      <TransactionStatus
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error}
        txHash={txHash}
      />
    </div>
  );
}
