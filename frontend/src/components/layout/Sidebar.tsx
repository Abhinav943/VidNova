"use client";

import { motion, Variants } from "framer-motion";
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  Gamepad2,
  Music,
  Trophy,
  Film,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const mainLinks = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PlaySquare, label: "Subscriptions", href: "/subscriptions" },
];

const libraryLinks = [
  { icon: Clock, label: "History", href: "/history" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
];

const categoryLinks = [
  { icon: Gamepad2, label: "Gaming", href: "/?search=Gaming" },
  { icon: Music, label: "Music", href: "/?search=Music" },
  { icon: Trophy, label: "Sports", href: "/?search=Sports" },
  { icon: Film, label: "Movies", href: "/?search=Movies" },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  const sidebarVariants: Variants = {
    open: { width: 240, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { width: 80, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const textVariants: Variants = {
    open: { opacity: 1, display: "block", transition: { delay: 0.1 } },
    closed: { opacity: 0, display: "none", transition: { duration: 0.1 } },
  };

  const NavItem = ({
    icon: Icon,
    label,
    href,
  }: {
    icon: React.ElementType;
    label: string;
    href: string;
  }) => {
    const isActive = pathname === href;

    return (
      <Link href={href}>
        <motion.div
          whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center px-4 py-3 my-1 rounded-lg cursor-pointer transition-colors relative ${
            isActive ? "bg-white/5" : ""
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 w-1 h-full bg-[#00f3ff] rounded-r-full shadow-[0_0_10px_#00f3ff]"
            />
          )}
          <Icon
            className={`w-6 h-6 shrink-0 ${
              isActive ? "text-[#00f3ff]" : "text-gray-400 group-hover:text-white"
            }`}
          />
          <motion.span
            variants={textVariants}
            className={`ml-4 font-medium whitespace-nowrap ${
              isActive ? "text-white" : "text-gray-400"
            }`}
          >
            {label}
          </motion.span>
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="open"
      animate={isOpen ? "open" : "closed"}
      className="h-[calc(100vh-4rem)] sticky top-16 left-0 overflow-y-auto glass border-t-0 border-l-0 scrollbar-hide py-4 z-40 hidden md:block"
    >
      <div className="px-3">
        {mainLinks.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </div>

      <motion.div variants={textVariants} className="my-4 border-t border-white/10" />

      <div className="px-3">
        {libraryLinks.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </div>

      {isLoggedIn && (
        <>
          <motion.div variants={textVariants} className="my-4 border-t border-white/10" />
          <div className="px-3">
            <NavItem icon={Upload} label="Upload" href="/upload" />
          </div>
        </>
      )}

      <motion.div variants={textVariants} className="my-4 border-t border-white/10" />

      <motion.div variants={textVariants} className="px-3">
        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Explore
        </h3>
        {categoryLinks.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </motion.div>
    </motion.aside>
  );
}
