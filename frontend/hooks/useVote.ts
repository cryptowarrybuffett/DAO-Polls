import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useVotingContract } from "./useVotingContract";
import { useState } from "react";

export function useVote() {
  const { address, abi, chainId } = useVotingContract();
  const [error, setError] = useState<Error | null>(null);

  const {
    writeContractAsync,
    data: txHash,
    isPending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

  async function vote(pollId: number, voteYes: boolean) {
    setError(null);
    try {
      console.log("Voting with:", { address, chainId, pollId, voteYes });
      const hash = await writeContractAsync({
        address,
        abi,
        functionName: "vote",
        args: [BigInt(pollId), voteYes],
      });
      console.log("Vote transaction hash:", hash);
    } catch (err) {
      console.error("Vote error:", err);
      setError(err as Error);
    }
  }

  function reset() {
    setError(null);
    resetWrite();
  }

  return {
    vote,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error: error || receiptError,
    reset,
  };
}
