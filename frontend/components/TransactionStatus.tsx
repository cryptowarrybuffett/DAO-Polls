"use client";

import { useChainId } from "wagmi";
import { getExplorerUrl } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface TransactionStatusProps {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash?: string;
}

export function TransactionStatus({
  isPending,
  isConfirming,
  isSuccess,
  error,
  txHash,
}: TransactionStatusProps) {
  const chainId = useChainId();

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <LoadingSpinner size="sm" />
        Waiting for wallet confirmation...
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 text-primary text-sm">
        <LoadingSpinner size="sm" />
        <span>
          Transaction submitted.{" "}
          {txHash && (
            <a
              href={getExplorerUrl(chainId, "tx", txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-hover"
            >
              View on explorer
            </a>
          )}
        </span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-success text-sm">
        Transaction confirmed.{" "}
        {txHash && (
          <a
            href={getExplorerUrl(chainId, "tx", txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on explorer
          </a>
        )}
      </div>
    );
  }

  if (error) {
    const message = error.message.includes("User rejected")
      ? "Transaction rejected by user."
      : error.message.slice(0, 120);
    return <div className="text-danger text-sm">{message}</div>;
  }

  return null;
}
