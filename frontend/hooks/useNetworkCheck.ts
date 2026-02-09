import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { SUPPORTED_CHAIN_IDS } from "@/lib/constants";

export function useNetworkCheck() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = SUPPORTED_CHAIN_IDS.includes(chainId as 84532 | 8453);

  function switchToBaseSepolia() {
    switchChain({ chainId: 84532 });
  }

  return {
    isConnected,
    isCorrectNetwork,
    currentChainId: chainId,
    switchToBaseSepolia,
  };
}
