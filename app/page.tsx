"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import StudioForm from "@/components/StudioForm";
import SceneCard from "@/components/SceneCard";
import GenerationProgress from "@/components/GenerationProgress";
import type {
  MusicVideoInput,
  GeneratedScene,
  PlanVideoResponse,
  GenerateSceneResponse,
  JobStatusResponse,
} from "@/types";

const POLL_INTERVAL_MS = 3000;

export default function Home() {
  const [isPlanning, setIsPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Track active polling intervals by jobId
  const pollingRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Clean up all polling on unmount
  useEffect(() => {
    const refs = pollingRefs.current;
    return () => {
      refs.forEach((id) => clearInterval(id));
    };
  }, []);

  // ------------------------------------------------------------------ //
  //  Plan
  // ------------------------------------------------------------------ //
  async function handlePlan(input: MusicVideoInput) {
    setIsPlanning(true);
    setPlanError(null);
    setScenes([]);
    setProjectTitle(null);

    try {
      const res = await fetch("/api/plan-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data: PlanVideoResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Planning failed");

      const planned: GeneratedScene[] = data.plan.scenes.map((s) => ({
        ...s,
        status: "pending",
      }));

      setProjectTitle(data.plan.projectTitle);
      setScenes(planned);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsPlanning(false);
    }
  }

  // ------------------------------------------------------------------ //
  //  Generate a single scene
  // ------------------------------------------------------------------ //
  const handleGenerateScene = useCallback(async (scene: GeneratedScene) => {
    // Mark as generating immediately
    setScenes((prev) =>
      prev.map((s) => (s.index === scene.index ? { ...s, status: "generating" } : s))
    );

    let jobId: string;
    try {
      const res = await fetch("/api/generate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.prompt,
          style: scene.mood.join(", "),
          sceneIndex: scene.index,
        }),
      });

      const data: GenerateSceneResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      jobId = data.jobId;

      setScenes((prev) =>
        prev.map((s) =>
          s.index === scene.index ? { ...s, status: "generating", jobId } : s
        )
      );
    } catch (err) {
      const error = err instanceof Error ? err.message : "Generation failed";
      setScenes((prev) =>
        prev.map((s) =>
          s.index === scene.index ? { ...s, status: "failed", error } : s
        )
      );
      return;
    }

    // Poll for job completion
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/job-status/${jobId}`);
        const data: JobStatusResponse & { error?: string } = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(intervalId);
          pollingRefs.current.delete(jobId);
          setScenes((prev) =>
            prev.map((s) =>
              s.index === scene.index
                ? { ...s, status: "completed", imageUrl: data.imageUrl }
                : s
            )
          );
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          clearInterval(intervalId);
          pollingRefs.current.delete(jobId);
          setScenes((prev) =>
            prev.map((s) =>
              s.index === scene.index
                ? { ...s, status: "failed", error: data.error ?? "Generation failed" }
                : s
            )
          );
        }
      } catch {
        // Network error during polling — keep trying
      }
    }, POLL_INTERVAL_MS);

    pollingRefs.current.set(jobId, intervalId);
  }, []);

  // ------------------------------------------------------------------ //
  //  Generate all pending/failed scenes
  // ------------------------------------------------------------------ //
  async function handleGenerateAll() {
    setIsGeneratingAll(true);
    const toGenerate = scenes.filter(
      (s) => s.status === "pending" || s.status === "failed"
    );

    // Fire them sequentially to avoid hammering the endpoint
    for (const scene of toGenerate) {
      await handleGenerateScene(scene);
    }
    setIsGeneratingAll(false);
  }

  // ------------------------------------------------------------------ //
  //  Derived stats
  // ------------------------------------------------------------------ //
  const completed = scenes.filter((s) => s.status === "completed").length;
  const generating = scenes.filter((s) => s.status === "generating").length;
  const failed = scenes.filter((s) => s.status === "failed").length;

  // ------------------------------------------------------------------ //
  //  Render
  // ------------------------------------------------------------------ //
  return (
    <main className="min-h-screen bg-studio-bg">
      {/* Header */}
      <header className="border-b border-studio-border bg-studio-card/50 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h1 className="text-lg font-bold text-studio-text leading-tight">
              AI Music Video Studio
            </h1>
            <p className="text-xs text-studio-text-dim">
              Powered by OpenAI + RunPod
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: form */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-studio-border bg-studio-card p-5">
            <h2 className="font-semibold text-studio-text mb-4">
              🎵 Your Song Details
            </h2>
            <StudioForm onSubmit={handlePlan} isLoading={isPlanning} />
          </div>

          {planError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              <strong>Error:</strong> {planError}
            </div>
          )}

          {scenes.length > 0 && (
            <GenerationProgress
              total={scenes.length}
              completed={completed}
              generating={generating}
              failed={failed}
              onGenerateAll={handleGenerateAll}
              isGeneratingAll={isGeneratingAll}
            />
          )}
        </aside>

        {/* Right: scenes grid */}
        <section className="lg:col-span-2">
          {scenes.length === 0 && !isPlanning && (
            <div className="flex flex-col items-center justify-center h-80 text-center gap-4 text-studio-muted">
              <span className="text-6xl opacity-30">🎞️</span>
              <p className="text-lg">Fill in your song details to generate a video plan.</p>
              <p className="text-sm opacity-70">
                AI will break your song into scenes with visual prompts, then
                you can generate images for each scene via RunPod.
              </p>
            </div>
          )}

          {isPlanning && (
            <div className="flex flex-col items-center justify-center h-80 gap-4 text-studio-text-dim">
              <svg className="h-10 w-10 animate-spin text-studio-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p>Planning your music video with AI…</p>
            </div>
          )}

          {scenes.length > 0 && (
            <>
              {projectTitle && (
                <h2 className="text-xl font-bold text-studio-text mb-4">
                  📽️ {projectTitle}
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {scenes.map((scene) => (
                  <SceneCard
                    key={scene.index}
                    scene={scene}
                    onGenerate={handleGenerateScene}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
