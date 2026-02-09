import Link from "next/link";
import { PollList } from "@/components/PollList";

export default function HomePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Polls</h1>
          <p className="text-text-secondary text-sm mt-1">
            Decentralized Yes/No voting on Base
          </p>
        </div>
        <Link
          href="/create"
          className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary-hover transition-all shadow-md shadow-primary/20 text-sm"
        >
          Create Poll
        </Link>
      </div>
      <PollList />
    </div>
  );
}
