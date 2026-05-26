// ---------- Music video project types ----------

export type VideoStyle =
  | "cinematic"
  | "anime"
  | "abstract"
  | "neon-cyberpunk"
  | "watercolor"
  | "retro-80s"
  | "nature"
  | "urban";

export type SceneStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed";

export interface MusicVideoInput {
  /** Song or album title */
  title: string;
  /** Comma-separated artist name(s) */
  artist: string;
  /** Short description of the song mood / lyrics theme */
  theme: string;
  /** Visual style for the generated scenes */
  style: VideoStyle;
  /** Number of scenes to generate (1–12) */
  sceneCount: number;
}

// ---------- AI planning types ----------

export interface PlannedScene {
  index: number;
  /** Human-readable title for the scene */
  title: string;
  /** Detailed image-generation prompt */
  prompt: string;
  /** Duration hint in seconds */
  duration: number;
  /** Mood / emotion keywords */
  mood: string[];
}

export interface VideoPlan {
  projectTitle: string;
  style: VideoStyle;
  scenes: PlannedScene[];
}

// ---------- Generation types ----------

export interface GeneratedScene extends PlannedScene {
  status: SceneStatus;
  /** RunPod job ID (set when generation is submitted) */
  jobId?: string;
  /** URL of the generated image returned by RunPod */
  imageUrl?: string;
  /** Error message if generation failed */
  error?: string;
}

// ---------- RunPod API types ----------

export interface RunPodJobRequest {
  input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    scheduler?: string;
  };
}

export interface RunPodJobResponse {
  id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  output?: Array<{ image: string }>;
  error?: string;
}

// ---------- API response types ----------

export interface PlanVideoResponse {
  plan: VideoPlan;
}

export interface GenerateSceneResponse {
  jobId: string;
  sceneIndex: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: RunPodJobResponse["status"];
  imageUrl?: string;
  error?: string;
}
