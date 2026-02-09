"use client";

import { useSession, signIn, signOut } from "next-auth/react";

interface TwitterConnectProps {
  compact?: boolean;
}

export function TwitterConnect({ compact = false }: TwitterConnectProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.twitterHandle) {
    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary">@{session.twitterHandle}</span>
          <button
            onClick={() => signOut()}
            className="text-xs text-text-secondary hover:text-danger transition-colors"
          >
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-3 p-3 bg-surface border border-border rounded-xl">
        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="text-sm text-foreground">@{session.twitterHandle}</span>
        <button
          onClick={() => signOut()}
          className="text-xs text-text-secondary hover:text-danger transition-colors ml-2"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => signIn("twitter")}
        className="text-xs text-primary hover:text-primary-hover transition-colors"
      >
        Connect X
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("twitter")}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-hover transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Connect Twitter (X)
    </button>
  );
}
