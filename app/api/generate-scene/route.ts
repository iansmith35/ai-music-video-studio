import { NextRequest, NextResponse } from "next/server";
import { submitImageJob } from "@/lib/runpod";
import type { GenerateSceneResponse } from "@/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, style, sceneIndex } = body as {
    prompt?: string;
    style?: string;
    sceneIndex?: number;
  };

  if (!prompt || typeof sceneIndex !== "number") {
    return NextResponse.json(
      { error: "Missing required fields: prompt, sceneIndex." },
      { status: 400 }
    );
  }

  try {
    const jobId = await submitImageJob(prompt, style);
    const response: GenerateSceneResponse = { jobId, sceneIndex };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-scene]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
