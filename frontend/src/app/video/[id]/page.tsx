"use client";

import { useEffect, useState, use } from "react";
import { Player } from "@/components/video/Player";
import { InteractionBar } from "@/components/video/InteractionBar";
import { CommentSection } from "@/components/video/CommentSection";
import { fetchVideoById, incrementViews, addToWatchHistory, type Video } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchVideoById(resolvedParams.id);
        setVideo(data);

        // Increment view count (fire and forget)
        incrementViews(resolvedParams.id).catch(() => {});

        // Add to watch history if logged in (fire and forget)
        if (isLoggedIn) {
          addToWatchHistory(resolvedParams.id).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to load video", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [resolvedParams.id, isLoggedIn]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center p-4 md:p-8 animate-pulse">
        <div className="w-full max-w-6xl aspect-video rounded-2xl bg-white/5 mb-6" />
        <div className="w-full max-w-6xl flex flex-col gap-4">
          <div className="h-8 bg-white/5 rounded w-3/4" />
          <div className="flex items-center gap-4 mt-2">
            <div className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
            <div className="h-6 bg-white/5 rounded w-1/4" />
            <div className="h-10 bg-white/5 rounded-full w-32 ml-auto" />
          </div>
          <div className="h-24 bg-white/5 rounded-xl mt-2" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white py-20">
        <h2 className="text-3xl font-bold">Video Not Found</h2>
        <p className="text-gray-400">This video may have been removed or is unavailable.</p>
        <Link
          href="/"
          className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-[#b026ff] to-[#00f3ff] text-black font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-shadow"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto pb-10">
      <Player videoUrl={video.videoFile} posterUrl={video.thumbnail} />
      <InteractionBar video={video} />
      <CommentSection videoId={resolvedParams.id} />
    </div>
  );
}
