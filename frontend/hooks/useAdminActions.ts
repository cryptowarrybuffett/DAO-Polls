"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useVotingContract } from "./useVotingContract";

export function usePausePoll() {
  const { address, abi } = useVotingContract();
  const { writeContractAsync, data: txHash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function pausePoll(pollId: number) {
    await writeContractAsync({
      address,
      abi,
      functionName: "pausePoll",
      args: [BigInt(pollId)],
    });
  }

  return { pausePoll, isPending, isConfirming, isSuccess, error, txHash, reset };
}

export function useUnpausePoll() {
  const { address, abi } = useVotingContract();
  const { writeContractAsync, data: txHash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function unpausePoll(pollId: number) {
    await writeContractAsync({
      address,
      abi,
      functionName: "unpausePoll",
      args: [BigInt(pollId)],
    });
  }

  return { unpausePoll, isPending, isConfirming, isSuccess, error, txHash, reset };
}
