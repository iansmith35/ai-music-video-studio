import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/runpod";
import type { JobStatusResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  try {
    const result = await getJobStatus(jobId);

    let imageUrl: string | undefined;
    if (result.status === "COMPLETED" && result.output?.[0]?.image) {
      imageUrl = result.output[0].image;
    }

    const response: JobStatusResponse = {
      jobId,
      status: result.status,
      imageUrl,
      error: result.error,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[job-status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
