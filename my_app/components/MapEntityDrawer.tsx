"use client";
import React, { useEffect, useState } from "react";
import { X, MapPin, Calendar, Heart, Share2, Clock, Info } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import PostCard from "./PostCard";

interface MapEntity {
  id: string;
  type: string;
  name: string;
  description: string;
  animal_type?: string;
  behavior_tags?: string[];
  image_url?: string;
  lat: number;
  lng: number;
}

interface MapEntityDrawerProps {
  entity: MapEntity | null;
  onClose: () => void;
}

export default function MapEntityDrawer({ entity, onClose }: MapEntityDrawerProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entity && entity.type === 'stray') {
      fetchHistory();
    }
  }, [entity]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Home Feed Posts
      const { data: homePosts } = await supabase
        .from('posts')
        .select('*, profiles(display_name, avatar_url)')
        .eq('stray_animal_id', entity?.id);

      // 2. Fetch Community Tab Posts
      const { data: commPosts } = await supabase
        .from('community_posts')
        .select('*, profiles(display_name, avatar_url)')
        .eq('stray_animal_id', entity?.id);

      // 3. Merge and Normalize
      const unified = [
        ...(homePosts || []).map(p => ({ ...p, source: 'home' })),
        ...(commPosts || []).map(p => ({ 
          ...p, 
          source: 'community',
          caption: p.bio || p.health_status, // Map bio to caption for display
          mood: p.type.replace('_', ' ')
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHistory(unified);
    } catch (error) {
      console.error("Error fetching unified history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!entity) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface-container-lowest shadow-level-5 z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header Image */}
      <div className="relative h-64 w-full shrink-0">
        <img 
          src={entity.image_url || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"} 
          alt={entity.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
        >
          <X size={20} />
        </Button>
        
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-white">{entity.name}</h2>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <MapPin size={14} /> {entity.animal_type === 'cat' ? 'Street Cat' : 'Stray Dog'} • Goa, India
              </p>
            </div>
            <Button size="sm" className="rounded-full gap-2">
              <Heart size={16} /> Help
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-8">
          {/* About Section */}
          <section>
            <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <Info size={18} className="text-primary" /> About
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
              {entity.description}
            </p>
            
            {/* Behavior Tags */}
            <div className="flex flex-wrap gap-2">
              {entity.behavior_tags?.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold capitalize"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-surface-container-low border-none shadow-none flex flex-col items-center">
              <Clock size={20} className="text-primary mb-2" />
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Last Update</span>
              <span className="text-sm font-bold text-on-surface">2 hours ago</span>
            </Card>
            <Card className="p-4 bg-surface-container-low border-none shadow-none flex flex-col items-center">
              <Share2 size={20} className="text-secondary mb-2" />
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Sightings</span>
              <span className="text-sm font-bold text-on-surface">{history.length} reports</span>
            </Card>
          </div>

          {/* Post History (Google Maps style) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center sticky top-0 bg-surface-container-lowest py-2 z-10 border-b border-surface-container/50">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Calendar size={18} className="text-primary" /> Sighting History
              </h3>
              <span className="text-xs text-on-surface-variant font-medium">Newest first</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 w-full bg-surface-container/20 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-6">
                {history.map((post) => (
                  <div key={post.id} className="transform scale-[0.95] origin-top">
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6 bg-surface-container-low rounded-3xl border border-dashed border-surface-container">
                <p className="text-on-surface-variant text-sm">No sighting history available yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-surface-container shrink-0 bg-surface-container-lowest">
        <Button className="w-full rounded-xl py-6 font-bold shadow-level-2">
          Update Sighting
        </Button>
      </div>
    </div>
  );
}
