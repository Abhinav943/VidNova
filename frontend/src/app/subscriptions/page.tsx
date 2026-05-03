"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlaySquare, RefreshCw, Bell } from "lucide-react";
import { getSubscribedChannels, type Video } from "@/services/api";
import { VideoCard } from "@/components/feed/VideoCard";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChannelInfo {
  _id: string;
  channelDetails: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getSubscribedChannels(user._id);
      setChannels(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  return (
    <div className="w-full px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#b026ff] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,127,0.4)]">
          <PlaySquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-gray-400 text-sm">Channels you follow</p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-full skeleton-loader" />
              <div className="h-3 w-20 rounded skeleton-loader" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <p>Failed to load subscriptions.</p>
          <button onClick={load} className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && channels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Bell className="w-16 h-16 text-gray-600" />
          <h2 className="text-2xl font-bold text-white">No subscriptions yet</h2>
          <p className="text-gray-400">Subscribe to channels to see their videos here.</p>
          <Link href="/" className="mt-2 px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-[#ff007f] to-[#b026ff] shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:shadow-[0_0_25px_rgba(176,38,255,0.5)] transition-all">
            Discover Creators
          </Link>
        </div>
      )}

      {!loading && !error && channels.length > 0 && (
        <>
          {/* Channel Avatars Strip */}
          <div className="flex flex-wrap gap-6 mb-10">
            {channels.map((sub, i) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/channel/${sub.channelDetails?.username}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#b026ff] transition-colors shadow-md">
                    <img
                      src={sub.channelDetails?.avatar}
                      alt={sub.channelDetails?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors max-w-[72px] truncate text-center">
                    @{sub.channelDetails?.username}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8">
            <h2 className="text-lg font-bold text-white mb-6">
              {channels.length} Channel{channels.length !== 1 ? "s" : ""} Subscribed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((sub, i) => (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={`/channel/${sub.channelDetails?.username}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#b026ff]/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 group-hover:border-[#b026ff] transition-colors shrink-0">
                      <img
                        src={sub.channelDetails?.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate group-hover:text-[#00f3ff] transition-colors">
                        {sub.channelDetails?.fullName}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        @{sub.channelDetails?.username}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
