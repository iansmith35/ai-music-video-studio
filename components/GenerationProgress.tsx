"use client";

interface GenerationProgressProps {
  total: number;
  completed: number;
  generating: number;
  failed: number;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
}

export default function GenerationProgress({
  total,
  completed,
  generating,
  failed,
  onGenerateAll,
  isGeneratingAll,
}: GenerationProgressProps) {
  const pending = total - completed - generating - failed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-studio-border bg-studio-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-studio-text">Generation Progress</h2>
        <span className="text-sm font-bold text-studio-accent">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-studio-bg overflow-hidden">
        <div
          className="h-full rounded-full bg-studio-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <div className="font-bold text-studio-text-dim">{pending}</div>
          <div className="text-studio-muted">Pending</div>
        </div>
        <div>
          <div className="font-bold text-yellow-400">{generating}</div>
          <div className="text-studio-muted">Running</div>
        </div>
        <div>
          <div className="font-bold text-green-400">{completed}</div>
          <div className="text-studio-muted">Done</div>
        </div>
        <div>
          <div className="font-bold text-red-400">{failed}</div>
          <div className="text-studio-muted">Failed</div>
        </div>
      </div>

      {/* Generate all button */}
      {pending + failed > 0 && (
        <button
          onClick={onGenerateAll}
          disabled={isGeneratingAll}
          className="w-full rounded-lg bg-studio-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGeneratingAll ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Generating All…
            </>
          ) : (
            <>🚀 Generate All {pending + failed} Scenes</>
          )}
        </button>
      )}

      {completed === total && total > 0 && (
        <div className="text-center text-sm font-semibold text-green-400">
          🎉 All scenes generated!
        </div>
      )}
    </div>
  );
}
