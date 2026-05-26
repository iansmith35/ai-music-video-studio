"use client";

import { useState } from "react";
import type { MusicVideoInput, VideoStyle } from "@/types";

const VIDEO_STYLES: { value: VideoStyle; label: string; emoji: string }[] = [
  { value: "cinematic", label: "Cinematic", emoji: "🎬" },
  { value: "anime", label: "Anime", emoji: "🌸" },
  { value: "abstract", label: "Abstract", emoji: "🎨" },
  { value: "neon-cyberpunk", label: "Neon Cyberpunk", emoji: "🌆" },
  { value: "watercolor", label: "Watercolor", emoji: "🖌️" },
  { value: "retro-80s", label: "Retro 80s", emoji: "📺" },
  { value: "nature", label: "Nature", emoji: "🌿" },
  { value: "urban", label: "Urban", emoji: "🏙️" },
];

interface StudioFormProps {
  onSubmit: (input: MusicVideoInput) => void;
  isLoading: boolean;
}

export default function StudioForm({ onSubmit, isLoading }: StudioFormProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState<VideoStyle>("cinematic");
  const [sceneCount, setSceneCount] = useState(6);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !theme.trim()) return;
    onSubmit({ title: title.trim(), artist: artist.trim(), theme: theme.trim(), style, sceneCount });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Song info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-studio-text-dim mb-1">
            Song Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bohemian Rhapsody"
            required
            className="w-full rounded-lg bg-studio-bg border border-studio-border px-3 py-2 text-sm text-studio-text placeholder-studio-muted focus:border-studio-accent focus:outline-none focus:ring-1 focus:ring-studio-accent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-studio-text-dim mb-1">
            Artist *
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Queen"
            required
            className="w-full rounded-lg bg-studio-bg border border-studio-border px-3 py-2 text-sm text-studio-text placeholder-studio-muted focus:border-studio-accent focus:outline-none focus:ring-1 focus:ring-studio-accent transition"
          />
        </div>
      </div>

      {/* Theme / mood */}
      <div>
        <label className="block text-sm font-medium text-studio-text-dim mb-1">
          Theme / Mood *
        </label>
        <textarea
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Describe the song's story, emotion, or key imagery…"
          required
          rows={3}
          className="w-full rounded-lg bg-studio-bg border border-studio-border px-3 py-2 text-sm text-studio-text placeholder-studio-muted focus:border-studio-accent focus:outline-none focus:ring-1 focus:ring-studio-accent transition resize-none"
        />
      </div>

      {/* Style selector */}
      <div>
        <label className="block text-sm font-medium text-studio-text-dim mb-2">
          Visual Style
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VIDEO_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                style === s.value
                  ? "border-studio-accent bg-studio-accent/20 text-studio-text"
                  : "border-studio-border bg-studio-card text-studio-text-dim hover:border-studio-accent/50"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scene count */}
      <div>
        <label className="block text-sm font-medium text-studio-text-dim mb-1">
          Number of Scenes:{" "}
          <span className="text-studio-text font-bold">{sceneCount}</span>
        </label>
        <input
          type="range"
          min={2}
          max={12}
          value={sceneCount}
          onChange={(e) => setSceneCount(Number(e.target.value))}
          className="w-full accent-studio-accent"
        />
        <div className="flex justify-between text-xs text-studio-muted mt-1">
          <span>2</span>
          <span>12</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !title || !artist || !theme}
        className="w-full rounded-lg bg-studio-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-studio-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Planning your video…
          </>
        ) : (
          <>✨ Plan My Music Video</>
        )}
      </button>
    </form>
  );
}
