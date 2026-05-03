"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Share2, CheckCircle2, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { toggleVideoLike, toggleSubscription, type Video } from "@/services/api";

interface InteractionBarProps {
  video: Video;
}

export function InteractionBar({ video }: InteractionBarProps) {
  const { isLoggedIn } = useAuth();
  const [isLiked, setIsLiked] = useState(video.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(video.likesCount ?? 0);
  const [isSubscribed, setIsSubscribed] = useState(video.owner?.isSubscribed ?? false);
  const [subscribersCount, setSubscribersCount] = useState(video.owner?.subscribersCount ?? 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn || isLikeLoading) return;
    // Optimistic update
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    setIsLikeLoading(true);
    try {
      await toggleVideoLike(video._id);
    } catch {
      // Rollback
      setIsLiked(!next);
      setLikesCount((c) => c + (next ? -1 : 1));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isLoggedIn || isSubLoading) return;
    const next = !isSubscribed;
    setIsSubscribed(next);
    setSubscribersCount((c) => c + (next ? 1 : -1));
    setIsSubLoading(true);
    try {
      await toggleSubscription(video.owner._id);
    } catch {
      setIsSubscribed(!next);
      setSubscribersCount((c) => c + (next ? -1 : 1));
    } finally {
      setIsSubLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch {
      /* clipboard not available */
    }
  };

  const formatCount = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : String(n);

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-md">
        {video.title}
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">

        {/* Creator Info */}
        <div className="relative flex items-center p-3 rounded-2xl overflow-hidden group min-w-[280px]">
          {/* Blurred Banner */}
          <div
            className="absolute inset-0 z-0 opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-40"
            style={{
              backgroundImage: `url(${video.owner?.coverImage || video.owner?.avatar})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10 flex items-center gap-4">
            <Link href={`/channel/${video.owner?.username}`}>
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)] hover:scale-105 transition-transform">
                <Image
                  src={video.owner?.avatar || ""}
                  alt={video.owner?.username || ""}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="flex flex-col mr-6">
              <Link href={`/channel/${video.owner?.username}`}>
                <span className="font-bold text-lg text-white group-hover:text-[#00f3ff] transition-colors cursor-pointer">
                  {video.owner?.username}
                </span>
              </Link>
              <span className="text-sm text-gray-400">
                {formatCount(subscribersCount)} subscribers
              </span>
            </div>

            {/* Subscribe Button */}
            {isLoggedIn ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubscribe}
                disabled={isSubLoading}
                className={`relative overflow-hidden rounded-full px-6 py-2 font-bold transition-all duration-300 flex items-center justify-center min-w-[140px] shadow-lg disabled:opacity-80 ${
                  isSubscribed
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    : "bg-gradient-to-r from-[#b026ff] to-[#00f3ff] text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isSubscribed ? (
                    <motion.div
                      key="subscribed"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#39ff14]" />
                      <span>Subscribed</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="subscribe"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                    >
                      Subscribe
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-full px-5 py-2 font-bold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all min-w-[140px] justify-center"
              >
                <LogIn className="w-4 h-4" />
                Subscribe
              </Link>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {/* Like/Dislike pill */}
          <div className="flex items-center bg-white/5 rounded-full border border-white/10">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={!isLoggedIn}
              className={`flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-l-full transition-colors relative overflow-hidden disabled:cursor-default ${
                isLiked ? "text-[#00f3ff]" : "text-white"
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{formatCount(likesCount)}</span>

              <AnimatePresence>
                {isLiked && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-[#00f3ff] rounded-full pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.button>
            <div className="w-px h-6 bg-white/20" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="px-4 py-2 hover:bg-white/10 rounded-r-full transition-colors text-white hover:text-[#ff007f]"
            >
              <ThumbsDown className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Share with toast */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-white"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Share</span>
            </motion.button>
            <AnimatePresence>
              {shareToast && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-[#39ff14]/20 border border-[#39ff14]/30 text-[#39ff14] text-xs font-medium rounded-full"
                >
                  Link copied!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Description Box */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors glass">
        <div className="flex gap-4 font-semibold text-sm mb-2 text-white">
          <span>{formatCount(video.views)} views</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          {video.duration && (
            <span>
              {Math.floor(video.duration / 60)}:{String(Math.round(video.duration % 60)).padStart(2, "0")}
            </span>
          )}
        </div>
        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
}
