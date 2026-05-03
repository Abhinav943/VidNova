"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

export function Player({ videoUrl, posterUrl }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default vibrant gradient since extracting colors from cross-origin video frames is complex
  // but we can animate the glow nicely.
  
  return (
    <div className="relative w-full max-w-6xl mx-auto mt-4 md:mt-8 px-4 flex justify-center">
      {/* Ambient Glow */}
      <motion.div 
        animate={{
          opacity: isPlaying ? 0.8 : 0.4,
          scale: isPlaying ? 1.05 : 1,
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 bg-gradient-to-r from-[#b026ff] via-[#00f3ff] to-[#ff007f] blur-[100px] opacity-50 rounded-full w-[80%] h-[80%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      
      {/* Video Container */}
      <div className="relative z-10 w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass-panel group">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="w-full h-full object-contain"
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay
        />
        
        {/* Custom controls overlay could go here, but using native controls for now for accessibility */}
      </div>
    </div>
  );
}
