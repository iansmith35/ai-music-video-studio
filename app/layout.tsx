import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Music Video Studio",
  description:
    "Create stunning AI-generated music videos with automated scene planning and RunPod-powered image generation.",
  keywords: ["AI", "music video", "image generation", "RunPod", "Stable Diffusion"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-studio-bg text-studio-text antialiased">
        {children}
      </body>
    </html>
  );
}
