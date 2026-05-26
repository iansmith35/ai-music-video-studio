import { NextRequest, NextResponse } from "next/server";
import { planMusicVideo } from "@/lib/openai";
import type { MusicVideoInput, PlanVideoResponse } from "@/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as Partial<MusicVideoInput>;

  if (!input.title || !input.artist || !input.theme || !input.style) {
    return NextResponse.json(
      { error: "Missing required fields: title, artist, theme, style." },
      { status: 400 }
    );
  }

  const sceneCount = Math.min(Math.max(Number(input.sceneCount) || 6, 1), 12);

  try {
    const plan = await planMusicVideo({
      title: input.title,
      artist: input.artist,
      theme: input.theme,
      style: input.style,
      sceneCount,
    });

    const response: PlanVideoResponse = { plan };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[plan-video]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
