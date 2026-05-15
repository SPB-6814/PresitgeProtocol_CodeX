"use client";
import React from "react";
import { Card } from "./ui/card";
import { Heart, Stethoscope, ArrowRight } from "lucide-react";

interface HomeSidebarProps {
  setActiveTab: (tab: string) => void;
}

export default function HomeSidebar({ setActiveTab }: HomeSidebarProps) {
  return (
    <div className="hidden lg:block w-[320px] shrink-0 sticky top-24 space-y-6 pt-8">
      {/* Needs Treatment Mini Post */}
      <Card className="p-4 border-surface-container shadow-level-1 hover:shadow-level-2 transition-shadow overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform"></div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-on-surface">
            <Stethoscope size={16} className="text-error" />
            Needs Treatment
          </h3>
          <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded">Urgent</span>
        </div>
        
        <div className="flex gap-3 items-center mb-3">
          <div className="w-12 h-12 rounded bg-surface-container-low overflow-hidden shrink-0">
             <img src="/pet2.png" alt="Pet" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Max (Broken Leg)</p>
            <p className="text-xs text-on-surface-variant">Paws Rescue Center</p>
          </div>
        </div>
        
        <div className="w-full bg-surface-container rounded-full h-1.5 mb-3">
          <div className="bg-error h-1.5 rounded-full w-[35%]"></div>
        </div>
        
        <button 
          onClick={() => setActiveTab("community")}
          className="w-full py-1.5 text-xs font-bold text-error hover:bg-error/5 rounded transition-colors flex items-center justify-center gap-1"
        >
          View & Help <ArrowRight size={14} />
        </button>
      </Card>

      {/* Adoption Mini Post */}
      <Card className="p-4 border-surface-container shadow-level-1 hover:shadow-level-2 transition-shadow overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform"></div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-on-surface">
            <Heart size={16} className="text-primary fill-primary/20" />
            Adopt a Friend
          </h3>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">New Match</span>
        </div>
        
        <div className="flex gap-3 items-center mb-3">
          <div className="w-12 h-12 rounded bg-surface-container-low overflow-hidden shrink-0">
             <img src="/pet1.png" alt="Pet" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Bella</p>
            <p className="text-xs text-on-surface-variant">Labrador Mix • 2 yrs</p>
          </div>
        </div>
        
        <button 
          onClick={() => setActiveTab("community")}
          className="w-full py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded transition-colors flex items-center justify-center gap-1"
        >
          View Profile <ArrowRight size={14} />
        </button>
      </Card>
      

    </div>
  );
}
