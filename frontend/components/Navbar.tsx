"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkBadge } from "./NetworkBadge";
import { TwitterConnect } from "./TwitterConnect";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function Navbar() {
  const isAdmin = useIsAdmin();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DAO Polls" width={28} height={28} />
            <span className="text-lg font-bold text-primary">DAO Polls</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/"
              className="text-text-secondary hover:text-foreground transition-colors text-sm"
            >
              Polls
            </Link>
            <Link
              href="/create"
              className="text-text-secondary hover:text-foreground transition-colors text-sm"
            >
              Create
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-warning hover:text-warning/80 transition-colors text-sm font-medium"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NetworkBadge />
          <TwitterConnect compact />
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </nav>
  );
}
