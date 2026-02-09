import { useAccount, useChainId } from "wagmi";
import { VOTING_CONTRACT_ABI, VOTING_CONTRACT_ADDRESSES } from "@/lib/contracts";

export function useVotingContract() {
  const configChainId = useChainId();
  const { chainId: walletChainId } = useAccount();
  // Prefer the wallet's actual chain over the config default
  const chainId = walletChainId ?? configChainId;
  const address = VOTING_CONTRACT_ADDRESSES[chainId] || VOTING_CONTRACT_ADDRESSES[84532];

  return {
    address,
    abi: VOTING_CONTRACT_ABI,
    chainId,
  };
}
