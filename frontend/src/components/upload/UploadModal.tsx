"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, FileVideo } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [estimatedMins, setEstimatedMins] = useState(0);

  const simulateUpload = useCallback(() => {
    setIsUploading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 150);
  }, []);

  const handleFileSelection = useCallback((selectedFile: File) => {
    if (selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setEstimatedMins(Math.floor(Math.random() * 5) + 1);
      simulateUpload();
    } else {
      alert("Please select a video file.");
    }
  }, [simulateUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, [handleFileSelection]);


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UploadCloud className="text-[#b026ff]" />
                Upload Video
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[300px]">
              
              {!isUploading ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full relative flex flex-col items-center justify-center p-12 border-2 dashed rounded-2xl transition-all duration-300 ${
                    isDragging 
                      ? "border-[#39ff14] bg-[#39ff14]/5 neon-glow-green scale-[1.02]" 
                      : "border-white/20 hover:border-[#00f3ff] hover:bg-[#00f3ff]/5"
                  }`}
                  style={{ borderStyle: 'dashed' }}
                >
                  <AnimatePresence>
                    {isDragging && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-[#39ff14] rounded-2xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                  
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className={`w-10 h-10 ${isDragging ? "text-[#39ff14]" : "text-gray-400"}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 text-center">
                    Drag and drop video files to upload
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 text-center">
                    Your videos will be private until you publish them.
                  </p>
                  
                  <label className="cursor-pointer">
                    <span className="bg-gradient-to-r from-[#b026ff] to-[#00f3ff] text-black font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(176,38,255,0.6)] transition-shadow">
                      Select Files
                    </span>
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} 
                    />
                  </label>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-6 neon-glow-cyan">
                    <FileVideo className="w-8 h-8 text-[#00f3ff]" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1">
                    Uploading {file?.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-8">
                    {uploadProgress}% • {estimatedMins} mins left
                  </p>
                  
                  {/* Vibrant Progress Bar */}
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#b026ff] via-[#00f3ff] to-[#39ff14] rounded-full relative"
                    >
                      {/* Sparkle effect */}
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 skew-x-[-20deg]"
                      />
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}