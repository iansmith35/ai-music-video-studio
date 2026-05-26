import OpenAI from "openai";
import type { MusicVideoInput, VideoPlan, PlannedScene, VideoStyle } from "@/types";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const STYLE_DESCRIPTIONS: Record<VideoStyle, string> = {
  cinematic: "cinematic film photography, shallow depth of field, dramatic lighting",
  anime: "anime illustration style, vibrant colors, expressive characters",
  abstract: "abstract digital art, geometric shapes, fluid motion, psychedelic",
  "neon-cyberpunk": "neon-lit cyberpunk cityscape, rain reflections, futuristic holographic",
  watercolor: "soft watercolor painting, delicate brushstrokes, pastel tones",
  "retro-80s": "1980s retro aesthetic, VHS grain, synthwave color palette",
  nature: "breathtaking natural landscape, golden hour, cinematic wide shot",
  urban: "urban street photography, graffiti, raw energy, documentary style",
};

/**
 * Use OpenAI to generate a video plan (scene-by-scene breakdown) for the given music video input.
 */
export async function planMusicVideo(input: MusicVideoInput): Promise<VideoPlan> {
  const client = getClient();
  const styleDesc = STYLE_DESCRIPTIONS[input.style];

  const systemPrompt = `You are a creative music video director AI. 
Given information about a song, you produce a detailed scene-by-scene music video plan.
Each scene must include a vivid Stable Diffusion image prompt tailored to the requested visual style.
Respond ONLY with valid JSON matching the schema provided.`;

  const userPrompt = `Create a ${input.sceneCount}-scene music video plan for:
- Title: "${input.title}"
- Artist: ${input.artist}
- Theme / mood: ${input.theme}
- Visual style: ${input.style} — ${styleDesc}

Return JSON with this exact schema:
{
  "projectTitle": "string",
  "style": "${input.style}",
  "scenes": [
    {
      "index": 0,
      "title": "short scene title",
      "prompt": "detailed stable diffusion image generation prompt (50-120 words), style: ${styleDesc}",
      "duration": 8,
      "mood": ["word1", "word2"]
    }
  ]
}

Rules:
- Scenes should tell a coherent visual story matching the theme.
- Each prompt must include style keywords: ${styleDesc}
- Duration is in seconds; total should roughly equal a 3-4 minute song.
- Include 2-4 mood words per scene.
- Return ONLY the JSON object with no markdown fences.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse OpenAI JSON response: ${raw.slice(0, 200)}`);
  }

  return validateVideoPlan(parsed, input.style, input.sceneCount);
}

/** Runtime validation + coercion for the OpenAI JSON output. */
function validateVideoPlan(raw: unknown, style: VideoStyle, expectedCount: number): VideoPlan {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid video plan: expected an object.");
  }

  const obj = raw as Record<string, unknown>;

  const projectTitle =
    typeof obj.projectTitle === "string" ? obj.projectTitle : "Untitled Music Video";

  const rawScenes = Array.isArray(obj.scenes) ? obj.scenes : [];

  const scenes: PlannedScene[] = rawScenes
    .slice(0, expectedCount)
    .map((s: unknown, i: number) => {
      const scene = (typeof s === "object" && s !== null ? s : {}) as Record<string, unknown>;
      return {
        index: typeof scene.index === "number" ? scene.index : i,
        title: typeof scene.title === "string" ? scene.title : `Scene ${i + 1}`,
        prompt: typeof scene.prompt === "string" ? scene.prompt : "",
        duration: typeof scene.duration === "number" ? scene.duration : 10,
        mood: Array.isArray(scene.mood)
          ? (scene.mood as unknown[]).filter((m): m is string => typeof m === "string")
          : [],
      };
    });

  return { projectTitle, style, scenes };
}
