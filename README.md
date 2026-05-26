# AI Music Video Studio

> Create stunning AI-generated music videos with automated scene planning and RunPod-powered image generation.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · OpenAI GPT-4o-mini · RunPod Serverless

---

## Features

- 🎵 **Song-driven planning** — describe your track; GPT-4o-mini breaks it into cinematic scenes with detailed Stable Diffusion prompts
- 🎨 **8 visual styles** — Cinematic, Anime, Abstract, Neon Cyberpunk, Watercolor, Retro 80s, Nature, Urban
- 🖼️ **Per-scene image generation** — each scene is submitted as an async RunPod job; images are polled automatically
- 📊 **Live progress dashboard** — see pending / running / completed / failed counts at a glance
- 🚀 **Generate All** — submit every pending scene in one click

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/iansmith35/ai-music-video-studio.git
cd ai-music-video-studio
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o-mini for planning) |
| `RUNPOD_API_KEY` | RunPod API key |
| `RUNPOD_ENDPOINT_ID` | Your RunPod serverless endpoint ID (Stable Diffusion) |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## RunPod Endpoint Setup

1. Sign in at [runpod.io](https://www.runpod.io)
2. Go to **Serverless → New Endpoint**
3. Choose a Stable Diffusion template (e.g. `runpod/worker-stable-diffusion-v2`)
4. Copy the **Endpoint ID** and your **API Key** into `.env.local`

The app expects the RunPod endpoint to accept:

```json
{
  "input": {
    "prompt": "...",
    "negative_prompt": "...",
    "width": 768,
    "height": 432,
    "num_inference_steps": 30,
    "guidance_scale": 7.5,
    "scheduler": "DPMSolverMultistep"
  }
}
```

and return `output[0].image` as a base64 or URL string.

---

## Project Structure

```
app/
  layout.tsx            # Root layout with metadata
  page.tsx              # Main studio page (client component)
  globals.css           # Tailwind base + custom styles
  api/
    plan-video/         # POST — AI scene planning via OpenAI
    generate-scene/     # POST — submit image job to RunPod
    job-status/[jobId]/ # GET  — poll RunPod job status
components/
  StudioForm.tsx        # Song input form + style selector
  SceneCard.tsx         # Per-scene card with image preview
  GenerationProgress.tsx# Progress bar + Generate All button
lib/
  openai.ts             # OpenAI integration (video planning)
  runpod.ts             # RunPod integration (job submit + poll)
types/
  index.ts              # Shared TypeScript types
```

---

## Deploying to Vercel

```bash
vercel deploy
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## License

MIT
