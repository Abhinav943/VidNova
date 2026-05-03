"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  fetchVideos, 
  apiClient, 
  toggleSubscription,
  type Video, 
  type VideoOwner 
} from "@/services/api";
import { VideoCard } from "@/components/feed/VideoCard";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, UserPlus, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ChannelProfile extends VideoOwner {
  email: string;
  subscribersCount: number;
  subscribedToChannelsCount: number;
  isSubscribed: boolean;
}

export default function ChannelPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const { username } = resolvedParams;
  const { user: currentUser, isLoggedIn } = useAuth();
  
  const [profile, setProfile] = useState<ChannelProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubLoading, setIsSubLoading] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const profileRes = await apiClient.get(`/users/channel/${username}`);
        setProfile(profileRes.data.data);

        // Fetch channel videos using the helper
        const data = await fetchVideos(1, 100);
        const allVideos = data.docs || [];
        setVideos(allVideos.filter((v: Video) => v.owner.username === username));
        
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username]);

  const handleSubscribe = async () => {
    if (!isLoggedIn || !profile || isSubLoading) return;
    setIsSubLoading(true);
    try {
      const res = await toggleSubscription(profile._id);
      setProfile({
        ...profile,
        isSubscribed: res.subscribed,
        subscribersCount: profile.subscribersCount + (res.subscribed ? 1 : -1)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center animate-pulse">
        <div className="w-full h-48 md:h-64 bg-white/5" />
        <div className="max-w-6xl w-full px-4 md:px-8 -mt-12 flex flex-col md:flex-row items-end gap-6">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-[#0A0A0A]" />
          <div className="flex-1 pb-4">
            <div className="h-8 bg-white/10 rounded w-48 mb-2" />
            <div className="h-4 bg-white/10 rounded w-32" />
          </div>
        </div>
        <div className="w-full max-w-6xl px-4 md:px-8 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-video bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
        <AlertCircle className="w-16 h-16 text-[#ff007f]" />
        <h2 className="text-2xl font-bold">{error || "Channel Not Found"}</h2>
        <Link href="/" className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Go Home</Link>
      </div>
    );
  }

  const isOwnChannel = currentUser?.username === username;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 relative bg-black">
        {profile.coverImage ? (
          <Image 
            src={profile.coverImage} 
            alt="Channel Banner" 
            fill 
            unoptimized
            className="object-cover opacity-60" 
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#b026ff]/20 to-[#00f3ff]/20" />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8 -mt-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0A0A0A] shadow-2xl bg-black relative">
            <Image 
              src={profile.avatar} 
              alt={profile.username} 
              fill 
              unoptimized
              className="object-cover" 
            />
          </div>
          
          <div className="flex-1 md:pb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              {profile.fullName}
              <CheckCircle2 className="w-6 h-6 text-[#00f3ff]" />
            </h1>
            <p className="text-gray-400 font-medium">@{profile.username} • {profile.subscribersCount} subscribers</p>
          </div>

          <div className="md:pb-2">
            {isOwnChannel ? (
              <button className="px-6 py-2 rounded-full bg-white/10 text-white font-bold border border-white/10 hover:bg-white/20 transition-all">
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isSubLoading || !isLoggedIn}
                className={`px-8 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
                  profile.isSubscribed
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    : "bg-gradient-to-r from-[#b026ff] to-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                }`}
              >
                {isSubLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 profile.isSubscribed ? "Subscribed" : (
                   <>
                    <UserPlus className="w-5 h-5" />
                    Subscribe
                   </>
                 )
                }
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-b border-white/10 flex gap-8">
          <button className="pb-4 border-b-2 border-[#00f3ff] text-white font-bold">Videos</button>
          <button className="pb-4 text-gray-500 hover:text-white transition-colors">About</button>
        </div>

        {/* Video Grid */}
        <div className="mt-8 pb-20">
          {videos.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-xl">No videos uploaded yet.</p>
            </div>
          ) : (
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
      </div>
    </div>
  );
}
