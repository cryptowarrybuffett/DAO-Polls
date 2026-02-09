import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { useVotingContract } from "./useVotingContract";
import type { PollData } from "./usePolls";

export function usePoll(pollId: number) {
  const { address, abi } = useVotingContract();
  const { address: userAddress } = useAccount();

  const { data: pollData, isLoading: isLoadingPoll, refetch: refetchPoll } = useReadContract({
    address,
    abi,
    functionName: "getPoll",
    args: [BigInt(pollId)],
    query: { refetchInterval: 10000 },
  });

  const { data: voters, isLoading: isLoadingVoters, refetch: refetchVoters } = useReadContract({
    address,
    abi,
    functionName: "getVoters",
    args: [BigInt(pollId)],
    query: { refetchInterval: 10000 },
  });

  const { data: voterChoice, refetch: refetchVoterChoice } = useReadContract({
    address,
    abi,
    functionName: "getVoterChoice",
    args: [BigInt(pollId), userAddress!],
    query: { enabled: !!userAddress, refetchInterval: 10000 },
  });

  let poll: PollData | null = null;
  if (pollData) {
    const r = pollData as unknown as {
      creator: string;
      endTime: bigint;
      exists: boolean;
      yesVotes: bigint;
      noVotes: bigint;
      title: string;
      description: string;
    };
    poll = {
      id: pollId,
      creator: r.creator,
      endTime: Number(r.endTime),
      exists: r.exists,
      yesVotes: r.yesVotes,
      noVotes: r.noVotes,
      title: r.title,
      description: r.description,
    };
  }

  const userVoted = voterChoice ? (voterChoice as unknown as [boolean, boolean])[0] : false;
  const userChoice = voterChoice ? (voterChoice as unknown as [boolean, boolean])[1] : false;

  function refetch() {
    refetchPoll();
    refetchVoters();
    refetchVoterChoice();
  }

  return {
    poll,
    voters: (voters as string[]) || [],
    userVoted,
    userChoice,
    isLoading: isLoadingPoll || isLoadingVoters,
    refetch,
  };
}
