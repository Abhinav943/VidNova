"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileVideo, X, ImagePlus, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { uploadVideoFile } from "@/services/api";
import Link from "next/link";

type Stage = "drop" | "form" | "uploading" | "success" | "error";

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("drop");
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  // ── Drag & Drop ──────────────────────────────────────────────────────────
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
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith("video/")) {
      setVideoFile(f);
      setStage("form");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type.startsWith("video/")) {
      setVideoFile(f);
      setStage("form");
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !title.trim() || !description.trim()) return;
    setStage("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    try {
      await uploadVideoFile(formData, (pct) => setProgress(pct));
      setStage("success");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosError.response?.data?.message || "Upload failed. Please try again.");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("drop");
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setTitle("");
    setDescription("");
    setProgress(0);
    setErrorMsg("");
  };

  if (!isLoading && !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#b026ff] to-[#00f3ff] flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(176,38,255,0.4)]">
          <UploadCloud className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-3xl font-bold text-white">Upload to VidNova</h1>
        <p className="text-gray-400 max-w-sm">You need to sign in to upload videos.</p>
        <Link
          href="/auth/login"
          className="mt-2 px-8 py-3 rounded-full font-bold text-black bg-gradient-to-r from-[#b026ff] to-[#00f3ff] shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 py-10 flex flex-col items-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#b026ff]/10 blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-[#00f3ff]/10 blur-[130px]"
        />
      </div>

      {/* Header */}
      <div className="relative w-full max-w-3xl mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Video</h1>
          <p className="text-gray-400 text-sm mt-0.5">Share your creativity with the world</p>
        </div>
      </div>

      <div className="relative w-full max-w-3xl">
        <AnimatePresence mode="wait">

          {/* ── Stage: Drop ── */}
          {stage === "drop" && (
            <motion.div
              key="drop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-3xl border border-white/10 p-10 md:p-16 flex flex-col items-center"
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full flex flex-col items-center justify-center gap-6 py-16 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  isDragging
                    ? "border-[#39ff14] bg-[#39ff14]/5 scale-[1.02]"
                    : "border-white/20 hover:border-[#00f3ff] hover:bg-[#00f3ff]/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-[#39ff14]/20 rounded-2xl pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{ y: isDragging ? -8 : 0 }}
                  className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner"
                >
                  <UploadCloud
                    className={`w-12 h-12 transition-colors ${
                      isDragging ? "text-[#39ff14]" : "text-gray-400"
                    }`}
                  />
                </motion.div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isDragging ? "Drop it!" : "Drag & drop your video"}
                  </h2>
                  <p className="text-gray-400 mb-4">or click to browse files</p>
                  <p className="text-xs text-gray-600">MP4, MOV, AVI, WebM supported</p>
                </div>

                <span className="px-8 py-3 rounded-full font-bold text-black bg-gradient-to-r from-[#b026ff] to-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(176,38,255,0.5)] transition-shadow pointer-events-none">
                  Select File
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </motion.div>
          )}

          {/* ── Stage: Form ── */}
          {stage === "form" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden"
            >
              {/* File info banner */}
              <div className="flex items-center gap-4 px-8 py-4 border-b border-white/10 bg-[#39ff14]/5">
                <div className="w-10 h-10 rounded-lg bg-[#39ff14]/20 flex items-center justify-center shrink-0">
                  <FileVideo className="w-5 h-5 text-[#39ff14]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{videoFile?.name}</p>
                  <p className="text-xs text-gray-400">
                    {videoFile ? (videoFile.size / 1_000_000).toFixed(1) : 0} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-8 flex flex-col gap-6">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-300">
                    Title <span className="text-[#ff007f]">*</span>
                  </label>
                  <input
                    id="upload-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your video an awesome title..."
                    maxLength={100}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#b026ff] focus:shadow-[0_0_0_3px_rgba(176,38,255,0.1)] transition-all"
                  />
                  <p className="text-xs text-gray-600 self-end">{title.length}/100</p>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-300">
                    Description <span className="text-[#ff007f]">*</span>
                  </label>
                  <textarea
                    id="upload-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers what your video is about..."
                    rows={5}
                    maxLength={2000}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#b026ff] focus:shadow-[0_0_0_3px_rgba(176,38,255,0.1)] transition-all resize-none"
                  />
                  <p className="text-xs text-gray-600 self-end">{description.length}/2000</p>
                </div>

                {/* Thumbnail */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">
                    Thumbnail <span className="text-gray-600 font-normal">(optional)</span>
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => thumbInputRef.current?.click()}
                    className="relative w-full max-w-xs h-36 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-[#b026ff] cursor-pointer transition-colors bg-white/5 flex items-center justify-center group"
                  >
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-[#b026ff] transition-colors">
                        <ImagePlus className="w-8 h-8" />
                        <span className="text-xs font-medium">Add thumbnail</span>
                      </div>
                    )}
                    {thumbnailPreview && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImagePlus className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </motion.div>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailSelect}
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={!title.trim() || !description.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#b026ff] to-[#00f3ff] shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <UploadCloud className="w-5 h-5" />
                    Upload Video
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}

          {/* ── Stage: Uploading ── */}
          {stage === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel rounded-3xl border border-white/10 p-12 flex flex-col items-center gap-8"
            >
              <div className="relative w-24 h-24">
                <div className="w-24 h-24 rounded-full border-4 border-white/10" />
                <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="url(#uploadGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="uploadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b026ff" />
                      <stop offset="100%" stopColor="#00f3ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{progress}%</span>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Uploading to Cloudinary</h2>
                <p className="text-gray-400 text-sm truncate max-w-xs">{videoFile?.name}</p>
              </div>

              {/* Gradient bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#b026ff] via-[#00f3ff] to-[#39ff14] rounded-full relative overflow-hidden"
                >
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── Stage: Success ── */}
          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl border border-[#39ff14]/20 p-12 flex flex-col items-center gap-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/30 flex items-center justify-center shadow-[0_0_40px_rgba(57,255,20,0.3)]"
              >
                <CheckCircle2 className="w-12 h-12 text-[#39ff14]" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Video Uploaded!</h2>
                <p className="text-gray-400">Your video is now live on VidNova.</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={reset}
                  className="px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Upload Another
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/")}
                  className="px-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#b026ff] to-[#00f3ff] shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all"
                >
                  Back to Home
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Stage: Error ── */}
          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl border border-[#ff007f]/20 p-12 flex flex-col items-center gap-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 flex items-center justify-center shadow-[0_0_40px_rgba(255,0,127,0.3)]">
                <AlertCircle className="w-12 h-12 text-[#ff007f]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Upload Failed</h2>
                <p className="text-gray-400 max-w-sm">{errorMsg}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff007f] to-[#b026ff] shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] transition-all"
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
