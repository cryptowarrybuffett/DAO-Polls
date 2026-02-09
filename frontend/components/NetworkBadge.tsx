"use client";

import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import { CHAIN_NAMES } from "@/lib/constants";

export function NetworkBadge() {
  const { isConnected, isCorrectNetwork, currentChainId, switchToBaseSepolia } =
    useNetworkCheck();

  if (!isConnected) return null;

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={switchToBaseSepolia}
        className="px-3 py-1 text-xs font-medium rounded-full bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors"
      >
        Wrong Network - Switch
      </button>
    );
  }

  return (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
      {CHAIN_NAMES[currentChainId] || "Unknown"}
    </span>
  );
}
