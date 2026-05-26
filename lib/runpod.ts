import type { RunPodJobRequest, RunPodJobResponse } from "@/types";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY ?? "";
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID ?? "";

const BASE_URL = `https://api.runpod.io/v2/${RUNPOD_ENDPOINT_ID}`;

function buildHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + RUNPOD_API_KEY,
  };
}

/**
 * Submit an image-generation job to a RunPod serverless endpoint.
 * Returns the RunPod job ID immediately (async job).
 */
export async function submitImageJob(
  prompt: string,
  style?: string
): Promise<string> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    throw new Error(
      "RunPod is not configured. Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID."
    );
  }

  const body: RunPodJobRequest = {
    input: {
      prompt: `${prompt}, ${style ?? "cinematic"}, highly detailed, 8k, masterpiece`,
      negative_prompt:
        "blurry, lowres, bad anatomy, worst quality, low quality, watermark, text",
      width: 768,
      height: 432,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      scheduler: "DPMSolverMultistep",
    },
  };

  const res = await fetch(`${BASE_URL}/run`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RunPod submit failed (${res.status}): ${text}`);
  }

  const data: RunPodJobResponse = await res.json();
  return data.id;
}

/**
 * Poll the status of a RunPod job.
 */
export async function getJobStatus(jobId: string): Promise<RunPodJobResponse> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    throw new Error(
      "RunPod is not configured. Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID."
    );
  }

  const res = await fetch(`${BASE_URL}/status/${jobId}`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RunPod status failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<RunPodJobResponse>;
}

/**
 * Cancel a running RunPod job.
 */
export async function cancelJob(jobId: string): Promise<void> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    return;
  }

  await fetch(`${BASE_URL}/cancel/${jobId}`, {
    method: "POST",
    headers: buildHeaders(),
  });
}
