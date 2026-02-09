"use client";

import { useAccount } from "wagmi";
import { isAdmin } from "@/lib/admin";

export function useIsAdmin(): boolean {
  const { address } = useAccount();
  return isAdmin(address);
}
