import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useVotingContract } from "./useVotingContract";
import { useState, useMemo } from "react";
import { decodeEventLog } from "viem";
import { VOTING_CONTRACT_ABI } from "@/lib/contracts";

export function useCreatePoll() {
  const { address, abi, chainId } = useVotingContract();
  const [error, setError] = useState<Error | null>(null);

  const {
    writeContractAsync,
    data: txHash,
    isPending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

  const createdPollId = useMemo<number | null>(() => {
    if (!receipt?.logs) return null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: VOTING_CONTRACT_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "PollCreated") {
          return Number((decoded.args as { pollId: bigint }).pollId);
        }
      } catch {
        // skip non-matching logs
      }
    }
    return null;
  }, [receipt]);

  async function createPoll(title: string, description: string, durationSeconds: number) {
    setError(null);
    try {
      console.log("Creating poll with:", { address, chainId, title, description, durationSeconds });
      const hash = await writeContractAsync({
        address,
        abi,
        functionName: "createPoll",
        args: [title, description, durationSeconds],
      });
      console.log("Transaction hash:", hash);
    } catch (err) {
      console.error("Create poll error:", err);
      setError(err as Error);
    }
  }

  function reset() {
    setError(null);
    resetWrite();
  }

  return {
    createPoll,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error: error || receiptError,
    createdPollId,
    reset,
  };
}
