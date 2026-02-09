/// Admin wallet addresses loaded from NEXT_PUBLIC_ADMIN_ADDRESSES env var.
/// Set as comma-separated addresses in .env.local:
///   NEXT_PUBLIC_ADMIN_ADDRESSES=0xabc...,0xdef...
/// These wallets can access the /admin page and hide/unhide polls.
/// Note: On-chain pause/unpause is restricted to the contract owner (deployer).

const admins = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.toLowerCase().split(",").map((a) => a.trim()).filter(Boolean);

export function isAdmin(address?: string): boolean {
  return admins?.includes(address?.toLowerCase() ?? "") ?? false;
}
