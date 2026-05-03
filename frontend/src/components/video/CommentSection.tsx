"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, Send, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import {
  getComments,
  addComment,
  deleteComment,
  toggleCommentLike,
  type Comment,
} from "@/services/api";

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

interface CommentSectionProps {
  videoId: string;
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();

  const loadComments = useCallback(async (isMounted = true, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await getComments(videoId);
      if (isMounted) {
        setComments(data.docs ?? data);
        setTotalComments(data.totalDocs ?? (data.docs ?? data).length);
      }
    } catch {
      /* comments may be empty */
    } finally {
      if (isMounted) setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    let isMounted = true;
    
    // Defer the call to a microtask to ensure it doesn't trigger cascading renders
    // during the initial component mount/effect cycle.
    Promise.resolve().then(() => {
      if (isMounted) {
        loadComments(isMounted, false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadComments]);

  const handleUpvote = async (commentId: string) => {
    if (!isLoggedIn) return;
    // Optimistic update
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId) {
          const next = !c.isLiked;
          return { ...c, isLiked: next, likesCount: c.likesCount + (next ? 1 : -1) };
        }
        return c;
      })
    );
    try {
      await toggleCommentLike(commentId);
    } catch (err: unknown) {
      console.error("Failed to toggle like", err);
      loadComments(true); // rollback on error
    }
  };

  const handleDelete = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setTotalComments((t) => t - 1);
    try {
      await deleteComment(commentId);
    } catch (err: unknown) {
      console.error("Failed to delete comment", err);
      loadComments(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    setIsSubmitting(true);
    try {
      const created = await addComment(videoId, newComment.trim());
      // The backend returns the raw comment; shape it to match Comment interface
      const shaped: Comment = {
        _id: created._id,
        content: created.content,
        createdAt: created.createdAt,
        ownerDetails: {
          _id: user!._id,
          username: user!.username,
          fullName: user!.fullName,
          avatar: user!.avatar,
        },
        likesCount: 0,
        isLiked: false,
      };
      setComments((prev) => [shaped, ...prev]);
      setTotalComments((t) => t + 1);
      setNewComment("");
      setIsInputFocused(false);
    } catch (err: unknown) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4 md:px-8 pb-20">
      <h3 className="text-xl font-bold text-white mb-6">{totalComments} Comments</h3>

      {/* Comment Input */}
      {isLoggedIn ? (
        <div className="flex gap-4 mb-10">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 border border-white/20">
            <Image
              src={user?.avatar || ""}
              alt={user?.username || ""}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col items-end gap-2">
            <motion.div
              animate={{ minHeight: isInputFocused ? 80 : 40 }}
              className={`w-full bg-transparent border-b-2 transition-colors duration-300 relative ${
                isInputFocused
                  ? "border-[#b026ff] shadow-[0_4px_15px_-3px_rgba(176,38,255,0.4)]"
                  : "border-white/20"
              }`}
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => { if (!newComment) setIsInputFocused(false); }}
                placeholder="Add a comment..."
                className="w-full h-full bg-transparent text-white placeholder-gray-500 outline-none resize-none py-2"
              />
            </motion.div>

            <AnimatePresence>
              {(isInputFocused || newComment) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2"
                >
                  <button
                    type="button"
                    onClick={() => { setNewComment(""); setIsInputFocused(false); }}
                    className="px-4 py-2 rounded-full font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-bold bg-[#b026ff] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_#b026ff] transition-shadow"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Comment
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            <Link href="/auth/login" className="text-[#00f3ff] hover:underline font-medium">
              Sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comment Thread */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <div className="h-3 bg-white/10 rounded w-1/4" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {comments.map((comment, index) => {
              const isOwn = user?._id === comment.ownerDetails?._id;
              return (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  className="flex gap-4 group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={comment.ownerDetails?.avatar || ""}
                      alt={comment.ownerDetails?.username || ""}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-200">
                        @{comment.ownerDetails?.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed mt-1">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleUpvote(comment._id)}
                        disabled={!isLoggedIn}
                        className={`flex items-center gap-1.5 text-xs font-medium hover:bg-white/10 px-2 py-1 rounded-full transition-colors active:scale-90 disabled:cursor-default ${
                          comment.isLiked
                            ? "text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`} />
                        {comment.likesCount}
                      </button>

                      {isOwn && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#ff007f] hover:bg-white/10 px-2 py-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {comments.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No comments yet.</p>
              <p className="text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
