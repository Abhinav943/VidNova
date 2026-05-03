"use client";

import { useEffect, useState, useCallback } from "react";
import { VideoCard } from "./VideoCard";
import { fetchVideos, type Video } from "@/services/api";
import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";

export function VideoGrid({ query }: { query?: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchVideos(1, 20, query);
      setVideos(data.docs ?? []);
    } catch (err) {
      console.error("Failed to load videos", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 w-full">
            <div className="w-full aspect-video rounded-xl skeleton-loader" />
            <div className="flex gap-3 px-1">
              <div className="w-10 h-10 rounded-full skeleton-loader shrink-0" />
              <div className="flex flex-col gap-2 w-full mt-1">
                <div className="w-[90%] h-4 rounded skeleton-loader" />
                <div className="w-[60%] h-3 rounded skeleton-loader" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
        <p className="text-lg">Failed to load videos.</p>
        <button
          onClick={loadVideos}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <p className="text-2xl font-bold text-white">No videos yet</p>
        <p className="text-sm">Be the first to upload something amazing!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 w-full">
      {videos.map((video, i) => (
        <motion.div
          key={video._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
        >
          <VideoCard video={video} />
        </motion.div>
      ))}
    </div>
  );
}
