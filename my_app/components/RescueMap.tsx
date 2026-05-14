"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Card } from "./ui/card";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";

// Dynamic import for Leaflet to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-container/20 animate-pulse flex items-center justify-center">
      <p className="text-on-surface-variant font-medium">Initializing Map...</p>
    </div>
  ),
});
import { UserPin } from "@/app/page";

interface RescueMapProps {
  userPins?: UserPin[];
}

export default function RescueMap({ userPins = [] }: RescueMapProps) {
  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2">
            Goa Rescue Network
          </h2>
          <p className="text-on-surface-variant text-[16px]">
            Real-time interactive tracking of stray reports and rescue centers across Goa.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          <Button variant="outline" className="bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors">
            Nearby Pet Hospitals
          </Button>
          <Button variant="ghost" className="bg-surface-container">
            Filter District
          </Button>
          <Button variant="secondary" className="gap-2">
            <MapPin size={18} /> Report Incident
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-surface-container shadow-level-2 h-[600px]">
        <MapComponent userPins={userPins} />
      </Card>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container/50">
          <h4 className="font-bold text-on-surface mb-1">Live Updates</h4>
          <p className="text-xs text-on-surface-variant">4 Active rescues in last 24 hours</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container/50">
          <h4 className="font-bold text-on-surface mb-1">Volunteer Network</h4>
          <p className="text-xs text-on-surface-variant">12 verified transporters online</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container/50">
          <h4 className="font-bold text-on-surface mb-1">Medical Aid</h4>
          <p className="text-xs text-on-surface-variant">2 emergency clinics available</p>
        </div>
      </div>
    </section>
  );
}
