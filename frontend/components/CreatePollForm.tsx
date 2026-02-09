"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useCreatePoll } from "@/hooks/useCreatePoll";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import { TransactionStatus } from "./TransactionStatus";
import { ImageUpload } from "./ImageUpload";
import { setPollMeta } from "@/lib/storage";
import type { PollOffchainMeta } from "@/lib/types";

export function CreatePollForm() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { isCorrectNetwork } = useNetworkCheck();
  const { createPoll, isPending, isConfirming, isSuccess, error, txHash, createdPollId, reset } =
    useCreatePoll();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationValue, setDurationValue] = useState("1");
  const [durationUnit, setDurationUnit] = useState<"hours" | "days" | "weeks">("days");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [requiresTwitter, setRequiresTwitter] = useState(false);

  useEffect(() => {
    if (isSuccess && createdPollId !== null) {
      const meta: PollOffchainMeta = {};
      if (imageUrl) meta.imageUrl = imageUrl;
      if (requiresTwitter) meta.requiresTwitter = true;
      if (Object.keys(meta).length > 0) {
        setPollMeta(createdPollId, meta);
      }
      const timer = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, createdPollId, imageUrl, requiresTwitter, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();

    const multipliers = { hours: 3600, days: 86400, weeks: 604800 };
    const durationSeconds = Number(durationValue) * multipliers[durationUnit];

    createPoll(title, description, durationSeconds);
  }

  if (!isConnected) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-lg shadow-black/20">
        <p className="text-text-secondary text-lg">
          Connect your wallet to create a poll
        </p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-lg shadow-black/20">
        <p className="text-danger text-lg">
          Switch to Base network to create a poll
        </p>
      </div>
    );
  }

  const disabled = isPending || isConfirming || !title.trim() || Number(durationValue) <= 0;

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-lg shadow-black/20">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What should we vote on?"
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
          maxLength={200}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide additional context (optional)"
          rows={3}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
          maxLength={1000}
        />
      </div>

      <ImageUpload onImageSelect={setImageUrl} currentImage={imageUrl} />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Duration
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            min="1"
            className="w-24 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
            required
          />
          <select
            value={durationUnit}
            onChange={(e) =>
              setDurationUnit(e.target.value as "hours" | "days" | "weeks")
            }
            className="px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={requiresTwitter}
          onClick={() => setRequiresTwitter(!requiresTwitter)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            requiresTwitter ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              requiresTwitter ? "translate-x-5" : ""
            }`}
          />
        </button>
        <label className="text-sm text-foreground">
          Require Twitter (X) account to vote
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary/20"
      >
        {isPending || isConfirming ? "Creating..." : "Create Poll"}
      </button>

      <TransactionStatus
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        error={error}
        txHash={txHash}
      />
    </form>
  );
}
