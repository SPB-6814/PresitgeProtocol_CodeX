"use client";
import React, { useState, useRef } from "react";
import { Camera, Heart, MessageCircle, Send, MoreHorizontal, Image as ImageIcon, MapPin, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import LocationPickerModal from "./LocationPickerModal";
import { UserPin } from "@/app/page";

const INITIAL_POSTS = [
  {
    id: 1,
    user: "Alex Rivera",
    avatar: "AR",
    image: "/pet1.png",
    caption: "Meet Cooper! He just had his first vaccination today. Such a brave boy! 🐾 #GoldenRetriever #PuppyLife",
    likes: 124,
    time: "2 hours ago",
    location: "Downtown Clinic"
  },
  {
    id: 2,
    user: "Sarah Chen",
    avatar: "SC",
    image: "/pet2.png",
    caption: "Mochi found her favorite spot in the house. Who can resist that face? 🐱✨",
    likes: 89,
    time: "5 hours ago",
    location: ""
  }
];

interface HomeFeedProps {
  onAddPin?: (pin: UserPin) => void;
}

export default function HomeFeed({ onAddPin }: HomeFeedProps) {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState("");
  const [postLocation, setPostLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [postImage, setPostImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPostImage(imageUrl);
    }
  };

  const handleUpload = () => {
    if (!newPostText) return;
    const newPost = {
      id: posts.length + 1,
      user: "You",
      avatar: "ME",
      image: postImage || "/pet1.png", // Use selected image or default
      caption: newPostText,
      likes: 0,
      time: "Just now",
      location: postLocation ? postLocation.address : ""
    };

    if (postLocation && onAddPin) {
      onAddPin({
        id: `post-${newPost.id}`,
        lat: postLocation.lat,
        lng: postLocation.lng,
        name: `Post by You`,
        description: newPostText
      });
    }

    setPosts([newPost, ...posts]);
    setNewPostText("");
    setPostLocation(null);
    setPostImage(null);
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
      <div className="space-y-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden border-surface-container shadow-level-2">
            {/* Post Header */}
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                  {post.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{post.user}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-on-surface-variant">{post.time}</p>
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
                src={post.image}
                alt="Pet"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex gap-4 mb-3">
                <Heart size={24} className="text-on-surface-variant hover:text-error cursor-pointer transition-colors" />
                <MessageCircle size={24} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
                <Send size={24} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
              </div>
              
              <p className="text-sm font-bold text-on-surface mb-1">
                {post.likes} likes
              </p>
              
              <p className="text-sm text-on-surface leading-relaxed">
                <span className="font-bold mr-2">{post.user}</span>
                {post.caption}
              </p>
            </div>
          </Card>
        ))}
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
