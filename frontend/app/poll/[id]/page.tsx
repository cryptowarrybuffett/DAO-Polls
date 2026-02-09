"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { usePoll } from "@/hooks/usePoll";
import { usePollMeta } from "@/hooks/usePollMeta";
import { VotePanel } from "@/components/VotePanel";
import { ResultsBar } from "@/components/ResultsBar";
import { VoterList } from "@/components/VoterList";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { truncateAddress, formatTimeRemaining, isPollActive, getExplorerUrl } from "@/lib/utils";
import { useChainId } from "wagmi";
import Link from "next/link";

export default function PollDetailPage() {
  const params = useParams();
  const pollId = Number(params.id);
  const chainId = useChainId();
  const { poll, voters, userVoted, userChoice, isLoading, refetch } = usePoll(pollId);
  const { meta } = usePollMeta(pollId);

  const handleVoteSuccess = useCallback(() => {
    setTimeout(() => refetch(), 2000);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-lg mb-4">Poll not found</p>
        <Link href="/" className="text-primary hover:text-primary-hover transition-colors">
          Back to polls
        </Link>
      </div>
    );
  }

  const active = isPollActive(poll.endTime);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/"
        className="text-text-secondary hover:text-foreground transition-colors text-sm inline-flex items-center gap-1"
      >
        &larr; Back to polls
      </Link>

      {/* Poll header */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg shadow-black/20">
        {meta?.imageUrl && (
          <div className="relative w-full h-56">
            <img
              src={meta.imageUrl}
              alt={poll.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h1 className="text-xl font-bold text-foreground">{poll.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              {meta?.requiresTwitter && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                  X Required
                </span>
              )}
              <span
                className={`px-2.5 py-1 text-xs rounded-full ${
                  active
                    ? "bg-success/20 text-success"
                    : "bg-text-secondary/20 text-text-secondary"
                }`}
              >
                {active ? "Active" : "Ended"}
              </span>
            </div>
          </div>

          {poll.description && (
            <p className="text-text-secondary mb-4">{poll.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
            <span>
              Created by{" "}
              <a
                href={getExplorerUrl(chainId, "address", poll.creator)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover font-mono"
              >
                {truncateAddress(poll.creator)}
              </a>
            </span>
            <span>{formatTimeRemaining(poll.endTime)}</span>
            <span>
              {Number(poll.yesVotes) + Number(poll.noVotes)} total vote
              {Number(poll.yesVotes) + Number(poll.noVotes) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Vote panel */}
      <VotePanel
        pollId={pollId}
        endTime={poll.endTime}
        userVoted={userVoted}
        userChoice={userChoice}
        onVoteSuccess={handleVoteSuccess}
      />

      {/* Results */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg shadow-black/20">
        <ResultsBar
          yesVotes={Number(poll.yesVotes)}
          noVotes={Number(poll.noVotes)}
        />
      </div>

      {/* Voter transparency */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg shadow-black/20">
        <VoterList pollId={pollId} voters={voters} />
      </div>
    </div>
  );
}
