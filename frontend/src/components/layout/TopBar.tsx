"use client";

import { Search, Upload, Bell, Menu, LogIn, LogOut, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function TopBar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push("/auth/login");
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass h-16 flex items-center justify-between px-4 lg:px-8">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#b026ff] to-[#00f3ff] flex items-center justify-center neon-glow-cyan"
          >
            <div className="w-4 h-4 bg-black rounded-full" />
          </motion.div>
          <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:text-glow transition-all">
            VidNova
          </span>
        </Link>
      </div>

      {/* Center Search */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex flex-1 max-w-xl px-4"
      >
        <div
          className={`flex items-center w-full bg-black/50 border rounded-full overflow-hidden transition-all duration-300 ${
            isSearchFocused
              ? "border-[#00f3ff] neon-glow-cyan bg-black/80"
              : "border-white/20 hover:border-white/40"
          }`}
        >
          <input
            type="text"
            placeholder="Search videos, creators..."
            className="w-full bg-transparent border-none outline-none px-6 py-2 text-white placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-white/5 hover:bg-white/10 transition-colors border-l border-white/20"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </form>

      {/* Right section */}
      <div className="flex items-center gap-3 lg:gap-4">
        {isLoggedIn && (
          <Link
            href="/upload"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#b026ff] to-[#ff007f] px-4 py-2 rounded-full font-semibold text-white shadow-[0_0_15px_rgba(176,38,255,0.5)] hover:shadow-[0_0_25px_rgba(255,0,127,0.8)] transition-shadow duration-300"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Link>
        )}

        {isLoggedIn && (
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative active:scale-95">
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ff007f] rounded-full shadow-[0_0_8px_rgba(255,0,127,0.8)]" />
          </button>
        )}

        {/* User Menu / Auth Button */}
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#b026ff] hover:border-[#00f3ff] transition-colors shadow-[0_0_10px_rgba(176,38,255,0.5)]"
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <UserCircle className="w-full h-full text-gray-300" />
              )}
            </motion.button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0">
                        <Image
                          src={user?.avatar || ""}
                          alt=""
                          fill
                          unoptimized
                          className="rounded-full object-cover border border-white/20"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          @{user?.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {[
                      { label: "My Channel", href: `/channel/${user?.username}` },
                      { label: "History", href: "/history" },
                      { label: "Liked Videos", href: "/liked" },
                      { label: "Subscriptions", href: "/subscriptions" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-white/10 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#ff007f] hover:bg-[#ff007f]/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
