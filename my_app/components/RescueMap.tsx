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

import { supabase } from "@/lib/supabase";
import MapEntityDrawer from "./MapEntityDrawer";

export default function RescueMap() {
  const [entities, setEntities] = React.useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchEntities = async (radiusMeters: number = 500000) => { // 500km default (covers the whole state)
    try {
      setLoading(true);
      
      // Attempt 1: Use the robust RPC function (returns clean lat/lng floats)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_entities_in_radius', {
        user_lat: 15.4909, // Default to central Goa
        user_lng: 73.8278,
        radius_meters: radiusMeters
      });

      if (!rpcError && rpcData) {
        setEntities(rpcData);
        return;
      }

      // Fallback: If RPC fails (e.g., user hasn't run the SQL yet), fetch raw and parse carefully
      console.warn("RPC failed, falling back to raw select. Did you run the SQL prompt?", rpcError);
      
      const { data: strays } = await supabase.from('stray_animals').select('*');
      const { data: points } = await supabase.from('map_points').select('*');

      const mappedEntities = [
        ...(strays || []).map(s => {
          let lng = 0, lat = 0;
          if (!s.location) return null;
          
          if (typeof s.location === 'object' && s.location.coordinates) {
            // Handled as GeoJSON
            lng = s.location.coordinates[0];
            lat = s.location.coordinates[1];
          } else if (typeof s.location === 'string') {
            // Handled as WKT string
            const match = s.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
            if (!match) return null;
            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);
          }

          return {
            id: s.id,
            type: 'stray',
            name: s.name,
            description: s.description,
            animal_type: s.animal_type,
            behavior_tags: s.behavior_tags,
            image_url: s.main_image_url,
            lng, lat
          };
        }),
        ...(points || []).map(p => {
          let lng = 0, lat = 0;
          if (!p.location) return null;
          
          if (typeof p.location === 'object' && p.location.coordinates) {
            lng = p.location.coordinates[0];
            lat = p.location.coordinates[1];
          } else if (typeof p.location === 'string') {
            const match = p.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
            if (!match) return null;
            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);
          }

          return {
            id: p.id,
            type: p.type,
            name: p.name,
            description: p.address,
            lng, lat
          };
        })
      ].filter(Boolean);

      setEntities(mappedEntities);
    } catch (error) {
      console.error("Error fetching map entities:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
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
          <Button 
            variant="outline" 
            onClick={() => fetchEntities(5000)}
            className="bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Strays Within 5km
          </Button>
          <Button variant="ghost" className="bg-surface-container">
            Filter District
          </Button>
          <Button variant="secondary" className="gap-2">
            <MapPin size={18} /> Report Incident
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-surface-container shadow-level-2 h-[600px] relative">
        <MapComponent 
          entities={entities} 
          onSelectEntity={(entity) => setSelectedEntity(entity)}
        />
      </Card>

      <MapEntityDrawer 
        entity={selectedEntity} 
        onClose={() => setSelectedEntity(null)} 
      />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container/50">
          <h4 className="font-bold text-on-surface mb-1">Live Updates</h4>
          <p className="text-xs text-on-surface-variant">{entities.filter(e => e.type === 'stray').length} Active reports across Goa</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container/50">
          <h4 className="font-bold text-on-surface mb-1">Vets & Clinics</h4>
          <p className="text-xs text-on-surface-variant">{entities.filter(e => e.type === 'vet').length} emergency centers nearby</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container/50">
          <h4 className="font-bold text-on-surface mb-1">Behavior Tracking</h4>
          <p className="text-xs text-on-surface-variant">Profiles managed by verified NGOs</p>
        </div>
      </div>
    </section>
  );
}
