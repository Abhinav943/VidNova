"use client";

import { VideoGrid } from "@/components/feed/VideoGrid";
import { use, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const resolvedSearchParams = use(searchParams);
  const query = resolvedSearchParams.search;

  const categories = [
    "All", "Gaming", "Cyberpunk", "Music", "Live", "Web Development", "UI/UX Design", "Framer Motion", "Recently Uploaded"
  ];

  const handleCategoryClick = (category: string) => {
    startTransition(() => {
      if (category === "All") {
        router.push("/");
      } else {
        router.push(`/?search=${encodeURIComponent(category)}`);
      }
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Category Chips Bar */}
      <div className="sticky top-0 z-30 w-full glass py-3 px-6 flex gap-3 overflow-x-auto scrollbar-hide border-b border-white/5">
        {categories.map((category) => {
          const isActive = (category === "All" && !query) || query === category;
          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              disabled={isPending}
              className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                isActive
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              } ${isPending ? "opacity-70 cursor-wait" : ""}`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Main Feed Content */}
      <VideoGrid query={query} />
    </div>
  );
}
