interface ResultsBarProps {
  yesVotes: number;
  noVotes: number;
}

export function ResultsBar({ yesVotes, noVotes }: ResultsBarProps) {
  const total = yesVotes + noVotes;
  const yesPercent = total > 0 ? Math.round((yesVotes / total) * 100) : 0;
  const noPercent = total > 0 ? 100 - yesPercent : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground font-medium">Results</span>
        <span className="text-text-secondary">{total} total vote{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Yes bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-success">Yes</span>
          <span className="text-text-secondary">
            {yesVotes} ({yesPercent}%)
          </span>
        </div>
        <div className="h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${yesPercent}%` }}
          />
        </div>
      </div>

      {/* No bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-danger">No</span>
          <span className="text-text-secondary">
            {noVotes} ({noPercent}%)
          </span>
        </div>
        <div className="h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-danger rounded-full transition-all duration-500"
            style={{ width: `${noPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
