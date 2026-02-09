export const SUPPORTED_CHAIN_IDS = [84532, 8453] as const;

export const CHAIN_NAMES: Record<number, string> = {
  84532: "Base Sepolia",
  8453: "Base",
};

export const BLOCK_EXPLORER_URLS: Record<number, string> = {
  84532: "https://sepolia.basescan.org",
  8453: "https://basescan.org",
};
