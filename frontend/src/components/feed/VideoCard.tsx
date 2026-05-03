"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Video } from "@/services/api";

export type { Video };

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoCard({ video }: { video: Video }) {
  const [isHovered, setIsHovered] = useState(false);

  const glowColors = ["#00f3ff", "#b026ff", "#ff007f", "#39ff14"];
  const glowColor = glowColors[video._id.charCodeAt(video._id.length - 1) % glowColors.length];

  return (
    <Link href={`/video/${video._id}`}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="flex flex-col gap-3 cursor-pointer group w-full"
      >
        {/* Thumbnail */}
        <div
          className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-transparent transition-all duration-300 z-10"
          style={{
            boxShadow: isHovered ? `0 0 20px ${glowColor}60` : "none",
            borderColor: isHovered ? glowColor : "transparent",
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full relative"
          >
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#b026ff]/20 to-[#00f3ff]/20 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No thumbnail</span>
              </div>
            )}

            {/* Hover video preview overlay */}
            <AnimatePresence>
              {isHovered && video.videoFile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 pointer-events-none"
                >
                  <video
                    src={video.videoFile}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm font-medium z-30">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex gap-3 px-1">
          <div className="flex-shrink-0 mt-1">
            <div className="relative w-9 h-9 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-[#b026ff] to-[#00f3ff]">
              <div className="w-full h-full rounded-full overflow-hidden border-[1.5px] border-black relative bg-black">
                {video.owner?.avatar ? (
                  <Image
                    src={video.owner.avatar}
                    alt={video.owner.username}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#b026ff] to-[#00f3ff]" />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug group-hover:text-[#00f3ff] transition-colors">
              {video.title}
            </h3>
            <p className="text-gray-400 text-xs mt-1 hover:text-white transition-colors truncate">
              {video.owner?.username}
            </p>
            <div className="flex items-center text-gray-500 text-xs mt-0.5">
              <span>{formatViews(video.views)} views</span>
              <span className="mx-1">•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
