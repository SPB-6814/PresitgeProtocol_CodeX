import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, MapPin, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import LocationPickerModal from "./LocationPickerModal";
import { UserPin } from "@/app/page";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";

interface HomeFeedProps {
  onAddPin?: (pin: UserPin) => void;
}

export default function HomeFeed({ onAddPin }: HomeFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [postLocation, setPostLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [postImage, setPostImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (display_name, avatar_url),
          comments (
            id,
            content,
            created_at,
            profiles (display_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Realtime subscription for comments
    const channel = supabase
      .channel('realtime-feed')
      .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'comments' 
      }, () => {
        // Refresh posts when comments change to get nested profile data
        fetchPosts();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts' 
    }, () => {
      fetchPosts();
    })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPostImage(imageUrl);
    }
  };

  const handleUpload = async () => {
    if (!newPostText) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            caption: newPostText,
            image_url: postImage || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
            location: postLocation ? postLocation.address : null,
            // likes and mood columns not found in database schema yet
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        if (postLocation && onAddPin) {
          onAddPin({
            id: `post-${data[0].id}`,
            lat: postLocation.lat,
            lng: postLocation.lng,
            name: `Post by You`,
            description: newPostText
          });
        }
        setNewPostText("");
        setPostLocation(null);
        setPostImage(null);
        fetchPosts(); // Refresh feed
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.code === '42501') {
        alert("Failed to create post: Row-Level Security (RLS) is blocking this request. Please add a policy to allow inserts.");
      } else if (error.code === 'PGRST204') {
        alert("Failed to create post: Database schema mismatch. Please ensure 'likes' and 'mood' columns exist.");
      } else {
        alert(`Failed to create post: ${error.message || "Unknown error"}`);
      }
    }
  };

  return (
    <div className="max-w-[600px] mx-auto pt-8 px-4">
      {/* Create Post */}
      <Card className="p-4 mb-8 border-surface-container shadow-level-1">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            ME
          </div>
          <div className="flex-1">
            <textarea
              placeholder="What's your pet up to today?"
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface resize-none min-h-[80px]"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
            {postImage && (
              <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-surface-container shadow-sm">
                <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPostImage(null)}
                  className="absolute top-1 right-1 bg-surface-container-lowest/80 text-on-surface p-1 rounded-full hover:bg-error hover:text-on-error transition-colors backdrop-blur-sm"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-surface-container/50">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-on-surface-variant hover:text-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={20} className="mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-primary">
                  <Camera size={20} className="mr-2" />
                  Camera
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`hover:text-primary ${postLocation ? 'text-primary bg-primary/10' : 'text-on-surface-variant'}`}
                  onClick={() => setIsLocationPickerOpen(true)}
                >
                  <MapPin size={20} className="mr-2" />
                  {postLocation ? "Location Added" : "Location"}
                </Button>
              </div>
              <Button size="sm" onClick={handleUpload} disabled={!newPostText}>
                Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Feed */}
      <div className="space-y-8 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Fetching the latest pet updates...</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-surface-container">
            <p className="text-on-surface-variant">No posts yet. Be the first to share your pet!</p>
          </div>
        )}
      </div>

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onConfirm={(lat, lng, address) => {
          setPostLocation({lat, lng, address});
        }}
      />
    </div>
  );
}
