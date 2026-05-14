"use client";
import React, { useState } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/lib/supabase";

interface Profile {
  display_name: string;
  avatar_url: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}

interface PostProps {
  post: {
    id: string;
    caption: string;
    image_url: string;
    mood: string;
    location?: string;
    created_at: string;
    likes: number;
    profiles: Profile;
    comments: Comment[];
  };
}

export default function PostCard({ post }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    const newCount = isLiked ? likesCount - 1 : likesCount + 1;
    const previousLikes = likesCount;
    const previousIsLiked = isLiked;

    // Optimistic UI update
    setLikesCount(newCount);
    setIsLiked(!isLiked);

    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: newCount })
        .eq('id', post.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert on error
      setLikesCount(previousLikes);
      setIsLiked(previousIsLiked);
    }
  };


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('comments')
        .insert([
          { 
            post_id: post.id, 
            content: newComment,
            user_id: user?.id || null // Include user_id if logged in
          }
        ]);

      if (error) throw error;
      setNewComment("");
    } catch (error: any) {
      console.error("Error posting comment:", error);
      alert(`Comment failed: ${error.message}`);
    }
  };


  return (
    <Card className="overflow-hidden border-surface-container shadow-level-2">
      {/* Post Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 overflow-hidden flex items-center justify-center">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt={post.profiles.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-secondary font-bold text-sm">
                {post.profiles?.display_name?.charAt(0) || "U"}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-on-surface">{post.profiles?.display_name}</p>
              {post.mood && (
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Mood: {post.mood} 🐾
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-on-surface-variant">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              {post.location && (
                <>
                  <span className="text-[10px] text-on-surface-variant">•</span>
                  <p className="text-[10px] text-primary flex items-center gap-0.5 font-medium">
                    <MapPin size={10} /> {post.location}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal size={18} />
        </Button>
      </div>

      {/* Post Image */}
      <div className="aspect-square relative bg-surface-container-low">
        <img
          src={post.image_url}
          alt="Post content"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex gap-4 mb-3">
          <Heart 
            size={24} 
            className={`cursor-pointer transition-colors ${isLiked ? 'text-error fill-error' : 'text-on-surface-variant hover:text-error'}`} 
            onClick={handleLike}
          />
          <MessageCircle 
            size={24} 
            className={`cursor-pointer transition-colors ${showComments ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            onClick={() => setShowComments(!showComments)}
          />
          <Send size={24} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
        </div>
        
        <p className="text-sm font-bold text-on-surface mb-1">
          {likesCount} likes
        </p>
        
        <p className="text-sm text-on-surface leading-relaxed">
          <span className="font-bold mr-2">{post.profiles?.display_name || "Pet Parent"}</span>
          {post.caption}
        </p>


        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-surface-container">
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-2 text-sm">
                  <span className="font-bold whitespace-nowrap">{comment.profiles?.display_name || "Someone"}</span>
                  <span className="text-on-surface-variant">{comment.content}</span>
                </div>
              ))}

              {(!post.comments || post.comments.length === 0) && (
                <p className="text-xs text-on-surface-variant italic">No comments yet.</p>
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 border-t border-surface-container/50 pt-2">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="flex-1 bg-transparent outline-none text-sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="text-primary font-semibold text-sm disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </Card>
  );
}
