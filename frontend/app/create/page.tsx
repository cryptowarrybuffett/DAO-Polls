import { CreatePollForm } from "@/components/CreatePollForm";

export default function CreatePollPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">Create a Poll</h1>
      <p className="text-text-secondary text-sm mb-6">
        Create an on-chain Yes/No poll. Anyone with a wallet can vote.
      </p>
      <CreatePollForm />
    </div>
  );
}
