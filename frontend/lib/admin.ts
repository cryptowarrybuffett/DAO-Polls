/// Admin wallet addresses (lowercase). Add your wallet address here.
/// These wallets can access the /admin page and hide/unhide polls.
/// Note: On-chain pause/unpause is restricted to the contract owner (deployer).
export const ADMIN_ADDRESSES: string[] = [
  // Add admin wallet addresses here (lowercase)
  // e.g. "0xb44d57a251da397bcbe33cfbbef567..."
];

export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
}
