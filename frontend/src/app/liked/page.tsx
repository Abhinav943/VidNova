"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, RefreshCw } from "lucide-react";
import { getLikedVideos, type Video } from "@/services/api";
import { VideoCard } from "@/components/feed/VideoCard";
import Link from "next/link";

export default function LikedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getLikedVideos();
      setVideos(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="w-full px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f3ff] to-[#39ff14] flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]">
          <ThumbsUp className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
          <p className="text-gray-400 text-sm">Videos you&apos;ve given a thumbs up</p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-video rounded-xl skeleton-loader" />
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full skeleton-loader shrink-0" />
                <div className="flex flex-col gap-2 flex-1 mt-1">
                  <div className="h-4 rounded skeleton-loader w-[85%]" />
                  <div className="h-3 rounded skeleton-loader w-[55%]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <p>Failed to load liked videos.</p>
          <button onClick={load} className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <ThumbsUp className="w-16 h-16 text-gray-600" />
          <h2 className="text-2xl font-bold text-white">No liked videos yet</h2>
          <p className="text-gray-400">Like videos as you watch them and they&apos;ll show up here.</p>
          <Link href="/" className="mt-2 px-6 py-2.5 rounded-full font-bold text-black bg-gradient-to-r from-[#00f3ff] to-[#39ff14] shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] transition-all">
            Browse Videos
          </Link>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, i) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
