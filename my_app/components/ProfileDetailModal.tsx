"use client";
import React from "react";
import { X, PawPrint, User, Calendar, CreditCard, Heart, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";

import MyPetsManager from "./MyPetsManager";

export type ProfileDetailType = "my_pet" | "health_vault" | "calendar" | "breeding_requests" | "adoption_requests" | null;

interface ProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ProfileDetailType;
}

export default function ProfileDetailModal({ isOpen, onClose, type }: ProfileDetailModalProps) {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !type) return null;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pet_requests')
        .select(`
          *,
          requester:profiles!requester_id(display_name, avatar_url),
          post:community_posts!post_id(name, image_url)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && (type === "breeding_requests" || type === "adoption_requests")) {
      fetchRequests();
    }
  }, [isOpen, type]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('pet_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests(); // Refresh list
    } catch (error: any) {
      alert("Failed to update status: " + error.message);
    }
  };

  const renderContent = () => {
    const isBreeding = type === "breeding_requests";
    const isAdoption = type === "adoption_requests";
    const filteredRequests = requests.filter(r => 
      isBreeding ? r.type === 'breeding' : r.type === 'adoption'
    );

    switch (type) {
      case "my_pet":
        return <MyPetsManager />;
      case "health_vault":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><User size={20} className="text-secondary" /> Health Records</h3>
            <div className="space-y-3">
              <div className="p-3 border border-surface-container rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Rabies Vaccination</p>
                  <p className="text-xs text-on-surface-variant">Administered: Oct 12, 2025</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Valid</span>
              </div>
              <div className="p-3 border border-surface-container rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Annual Checkup</p>
                  <p className="text-xs text-on-surface-variant">Administered: Aug 5, 2025</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">View Notes</Button>
              </div>
            </div>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} className="text-tertiary" /> Upcoming Schedules</h3>
            <div className="p-4 bg-tertiary/5 border border-tertiary/20 rounded-xl relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
               <p className="font-bold text-sm text-tertiary">Grooming Appointment</p>
               <p className="text-xs text-on-surface mb-2">Tomorrow at 10:00 AM</p>
               <p className="text-[10px] text-on-surface-variant">Bark & Bubble Salon</p>
            </div>
            <div className="p-4 border border-surface-container rounded-xl relative overflow-hidden">
               <p className="font-bold text-sm text-on-surface">Flea & Tick Medication</p>
               <p className="text-xs text-on-surface mb-2">In 5 Days</p>
               <Button variant="secondary" size="sm" className="w-full text-xs h-7">Mark as Done</Button>
            </div>
          </div>
        );

      case "breeding_requests":
      case "adoption_requests":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {isBreeding ? <Heart size={20} className="text-error fill-error/20" /> : <PawPrint size={20} className="text-primary" />}
              {isBreeding ? "Breeding Requests" : "Adoption Requests"}
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="p-4 border border-surface-container shadow-sm rounded-2xl bg-surface-container-low transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden border border-surface-container">
                          <img src={req.post?.image_url || "/pet1.png"} alt={req.post?.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{req.post?.name}</p>
                          <p className="text-xs text-on-surface-variant">From: {req.requester?.display_name || "Unknown"}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    {req.message && (
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4 bg-surface-container-lowest p-3 rounded-xl italic">
                        "{req.message}"
                      </p>
                    )}
                    
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 h-9 text-xs font-bold bg-primary text-on-primary"
                          onClick={() => handleStatusUpdate(req.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 h-9 text-xs font-bold border-surface-container text-on-surface-variant"
                          onClick={() => handleStatusUpdate(req.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-dashed border-surface-container">
                {isBreeding ? <Heart size={32} className="mx-auto mb-3 text-on-surface-variant/30" /> : <PawPrint size={32} className="mx-auto mb-3 text-on-surface-variant/30" />}
                <p className="text-sm text-on-surface-variant">No {isBreeding ? "breeding" : "adoption"} requests yet.</p>
              </div>
            )}
          </div>
        );
      default:
        return <p>Content not found.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-level-2 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border border-surface-container/50">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
