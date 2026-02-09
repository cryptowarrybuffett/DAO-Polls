"use client";

import { useState } from "react";
import { useReadContracts } from "wagmi";
import { useVotingContract } from "@/hooks/useVotingContract";
import { truncateAddress, getExplorerUrl } from "@/lib/utils";
import { useChainId } from "wagmi";

interface VoterListProps {
  pollId: number;
  voters: string[];
}

export function VoterList({ pollId, voters }: VoterListProps) {
  const [expanded, setExpanded] = useState(false);
  const { address, abi } = useVotingContract();
  const chainId = useChainId();

  const contracts = voters.map((voter) => ({
    address,
    abi,
    functionName: "getVoterChoice" as const,
    args: [BigInt(pollId), voter as `0x${string}`] as const,
  }));

  const { data: choices } = useReadContracts({
    contracts,
    query: { enabled: voters.length > 0 },
  });

  if (voters.length === 0) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        No votes yet
      </div>
    );
  }

  const displayedVoters = expanded ? voters : voters.slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-foreground">
          Voters ({voters.length})
        </h4>
        {voters.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:text-primary-hover transition-colors"
          >
            {expanded ? "Show less" : `Show all ${voters.length}`}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {displayedVoters.map((voter, i) => {
          const choice = choices?.[i];
          const voted = choice?.status === "success" && choice.result
            ? (choice.result as [boolean, boolean])[0]
            : false;
          const voteYes = choice?.status === "success" && choice.result
            ? (choice.result as [boolean, boolean])[1]
            : false;

          return (
            <div
              key={voter}
              className="flex items-center justify-between py-1.5 px-3 bg-background rounded-lg text-sm"
            >
              <a
                href={getExplorerUrl(chainId, "address", voter)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary transition-colors font-mono"
              >
                {truncateAddress(voter)}
              </a>
              {voted && (
                <span
                  className={`text-xs font-medium ${
                    voteYes ? "text-success" : "text-danger"
                  }`}
                >
                  {voteYes ? "Yes" : "No"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
