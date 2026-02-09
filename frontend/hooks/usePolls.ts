import { useReadContract, useReadContracts } from "wagmi";
import { useVotingContract } from "./useVotingContract";

export interface PollData {
  id: number;
  creator: string;
  endTime: number;
  exists: boolean;
  yesVotes: bigint;
  noVotes: bigint;
  title: string;
  description: string;
}

export function usePolls() {
  const { address, abi } = useVotingContract();

  const { data: pollCount, isLoading: isLoadingCount } = useReadContract({
    address,
    abi,
    functionName: "getPollCount",
    query: { refetchInterval: 10000 },
  });

  const count = pollCount ? Number(pollCount) : 0;

  const contracts = Array.from({ length: count }, (_, i) => ({
    address,
    abi,
    functionName: "getPoll" as const,
    args: [BigInt(i)] as const,
  }));

  const { data: pollsData, isLoading: isLoadingPolls } = useReadContracts({
    contracts,
    query: {
      enabled: count > 0,
      refetchInterval: 10000,
    },
  });

  const polls: PollData[] = (pollsData || [])
    .map((result, index) => {
      if (result.status !== "success" || !result.result) return null;
      const r = result.result as unknown as {
        creator: string;
        endTime: bigint;
        exists: boolean;
        yesVotes: bigint;
        noVotes: bigint;
        title: string;
        description: string;
      };
      return {
        id: index,
        creator: r.creator,
        endTime: Number(r.endTime),
        exists: r.exists,
        yesVotes: r.yesVotes,
        noVotes: r.noVotes,
        title: r.title,
        description: r.description,
      };
    })
    .filter((p): p is PollData => p !== null);

  return {
    polls,
    pollCount: count,
    isLoading: isLoadingCount || isLoadingPolls,
  };
}
