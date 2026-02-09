"use client";

import { usePolls } from "@/hooks/usePolls";
import { PollCard } from "./PollCard";
import { LoadingSpinner } from "./LoadingSpinner";

export function PollList() {
  const { polls, isLoading } = usePolls();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-lg mb-2">No polls yet</p>
        <p className="text-text-secondary text-sm">
          Be the first to create a poll!
        </p>
      </div>
    );
  }

  // Show newest polls first
  const sortedPolls = [...polls].reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {sortedPolls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
