"use client";
import React, { useState, useRef } from "react";
import { X, Camera, Image as ImageIcon, Loader2, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/lib/supabase";

interface CreateCommunityPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCommunityPostModal({ isOpen, onClose, onSuccess }: CreateCommunityPostModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"adoption" | "breeding" | "treatment" | "stray_report">("adoption");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bio, setBio] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [pedigree, setPedigree] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !image) return alert("Please select an image");

    try {
      setLoading(true);
      
      let finalImageData = image || "";

      // Convert to Base64 if it's a new file
      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(imageFile);
        });
        finalImageData = await base64Promise;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("You must be logged in to create a listing.");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: user.id,
            type,
            name: type === "treatment" || type === "stray_report" ? null : name,
            breed,
            age,
            gender,
            bio,
            health_status: healthStatus,
            pedigree: type === "breeding" ? pedigree : null,
            location_tag: location,
            image_url: finalImageData,
          }
        ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error details:", JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.details || "Unknown database error";
      alert(`Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-surface-container shadow-level-5 flex flex-col">
        <div className="p-4 border-b border-surface-container flex justify-between items-center sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="text-xl font-bold text-on-surface">Create Community Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type Selection */}
          <div className="flex flex-wrap gap-2">
            {(["adoption", "breeding", "treatment"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                  type === t 
                    ? "bg-primary text-on-primary shadow-level-1" 
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload Area */}
            <div 
              className="aspect-square rounded-2xl border-2 border-dashed border-surface-container flex flex-col items-center justify-center bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="text-on-surface-variant mb-2" size={32} />
                  <p className="text-xs text-on-surface-variant font-medium">Click to upload photo</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              {type !== "treatment" && (
                <div>
                  <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">PET NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Oliver" 
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={type !== "treatment"}
                  />
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">BREED</label>
                <input 
                  type="text" 
                  placeholder="e.g. Golden Retriever" 
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">AGE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2 years" 
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">GENDER</label>
                  <select 
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">LOCATION</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="Where is the pet located?" 
                  className="w-full pl-10 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">
                {type === "treatment" ? "CASE DETAILS / ISSUE" : "BIO / DESCRIPTION"}
              </label>
              <textarea 
                placeholder={type === "treatment" ? "Explain the medical condition..." : "Tell us about the pet's personality..."} 
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>

            {type === "adoption" && (
              <div>
                <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">HEALTH STATUS</label>
                <input 
                  type="text" 
                  placeholder="e.g. Vaccinated, Spayed" 
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                />
              </div>
            )}

            {type === "breeding" && (
              <div>
                <label className="text-xs font-bold text-on-surface-variant ml-1 mb-1 block">PEDIGREE / REGISTRATION</label>
                <input 
                  type="text" 
                  placeholder="e.g. AKC Registered, Champion bloodline" 
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={pedigree}
                  onChange={(e) => setPedigree(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-surface-container flex gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-[2] rounded-xl font-bold shadow-level-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Posting...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
