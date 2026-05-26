"use client";

import Image from "next/image";
import type { GeneratedScene } from "@/types";

interface SceneCardProps {
  scene: GeneratedScene;
  onGenerate: (scene: GeneratedScene) => void;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-studio-muted", bg: "bg-studio-muted/10" },
  generating: { label: "Generating…", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  completed: { label: "Done", color: "text-green-400", bg: "bg-green-400/10" },
  failed: { label: "Failed", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function SceneCard({ scene, onGenerate }: SceneCardProps) {
  const config = STATUS_CONFIG[scene.status];

  return (
    <div className="rounded-xl border border-studio-border bg-studio-card overflow-hidden flex flex-col">
      {/* Image area */}
      <div className="relative aspect-video bg-studio-bg">
        {scene.status === "completed" && scene.imageUrl ? (
          <Image
            src={scene.imageUrl}
            alt={scene.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : scene.status === "generating" ? (
          <div className="absolute inset-0 shimmer" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-studio-muted gap-2">
            <svg className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
            </svg>
            <span className="text-xs">No image yet</span>
          </div>
        )}

        {/* Scene number badge */}
        <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
          #{scene.index + 1}
        </div>

        {/* Status badge */}
        <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}>
          {config.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <h3 className="font-semibold text-sm text-studio-text truncate">{scene.title}</h3>

        <p className="text-xs text-studio-text-dim line-clamp-3 flex-1">{scene.prompt}</p>

        {/* Mood tags */}
        {scene.mood.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {scene.mood.map((m) => (
              <span key={m} className="rounded-full bg-studio-accent/10 border border-studio-accent/30 px-2 py-0.5 text-xs text-studio-accent">
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-studio-muted">{scene.duration}s</span>

          {scene.status === "failed" && scene.error && (
            <span className="text-xs text-red-400 truncate max-w-[60%]">{scene.error}</span>
          )}

          {(scene.status === "pending" || scene.status === "failed") && (
            <button
              onClick={() => onGenerate(scene)}
              className="rounded-lg bg-studio-accent px-3 py-1 text-xs font-semibold text-white hover:bg-studio-accent-hover transition"
            >
              {scene.status === "failed" ? "Retry" : "Generate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
