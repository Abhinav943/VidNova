"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, UserPlus, Loader2, Camera, ArrowRight, ArrowLeft, ImagePlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const STEPS = ["Account Info", "Profile Media"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 files
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { register } = useAuth();
  const router = useRouter();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) {
      setError("An avatar image is required.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar", avatarFile);
      if (coverFile) formData.append("coverImage", coverFile);

      await register(formData);
      router.push("/");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[#b026ff]/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-[#39ff14]/10 blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#b026ff] to-[#00f3ff] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(176,38,255,0.5)]"
            >
              <div className="w-7 h-7 bg-black rounded-full" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Join VidNova</h1>
            <p className="text-gray-400 text-sm mt-1">Create your creator account</p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 w-full">
                  <div
                    className={`h-1 rounded-full w-full transition-all duration-500 ${
                      i <= step
                        ? "bg-gradient-to-r from-[#b026ff] to-[#00f3ff]"
                        : "bg-white/10"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      i === step ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleNext}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Satoshi Nakamoto"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#b026ff] focus:shadow-[0_0_0_3px_rgba(176,38,255,0.1)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Username</label>
                  <input
                    id="reg-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                    placeholder="neonsamurai"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#b026ff] focus:shadow-[0_0_0_3px_rgba(176,38,255,0.1)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#b026ff] focus:shadow-[0_0_0_3px_rgba(176,38,255,0.1)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Password</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Strong password (min. score 3/4)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none focus:border-[#b026ff] focus:shadow-[0_0_0_3px_rgba(176,38,255,0.1)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#ff007f] text-sm bg-[#ff007f]/10 border border-[#ff007f]/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#b026ff] to-[#00f3ff] shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
              >
                {/* Avatar Picker */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-medium text-gray-400 self-start">
                    Avatar <span className="text-[#ff007f]">*</span>
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-white/30 hover:border-[#b026ff] cursor-pointer transition-colors bg-white/5 flex items-center justify-center group"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-500 group-hover:text-[#b026ff] transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-gray-500">Click to upload your avatar</p>
                </div>

                {/* Cover Image Picker */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-400">
                    Cover Image <span className="text-gray-600">(optional)</span>
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => coverInputRef.current?.click()}
                    className="relative w-full h-24 rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-[#00f3ff] cursor-pointer transition-colors bg-white/5 flex items-center justify-center group"
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-[#00f3ff] transition-colors">
                        <ImagePlus className="w-6 h-6" />
                        <span className="text-xs">Add cover image</span>
                      </div>
                    )}
                  </motion.div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#ff007f] text-sm bg-[#ff007f]/10 border border-[#ff007f]/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => { setStep(0); setError(""); }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isLoading || !avatarFile}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#b026ff] to-[#00f3ff] shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" /> Create Account
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#00f3ff] hover:text-white font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
