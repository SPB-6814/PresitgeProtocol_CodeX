import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "./ui/card";
import { MapPin, Search } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import MapEntityDrawer from "./MapEntityDrawer";
import { fetchMapEntities } from "@/lib/map-utils";
import { geocodeLocation } from "@/lib/geocoding";

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

export default function RescueMap() {
  const [entities, setEntities] = React.useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [userLocation, setUserLocation] = React.useState<{lat: number, lng: number}>({lat: 15.4909, lng: 73.8278});
  const [locationLoaded, setLocationLoaded] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadEntities = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const data = await fetchMapEntities(lat, lng);
      setEntities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          loadEntities(lat, lng);
          setLocationLoaded(true);
        },
        (error) => {
          console.warn("Geolocation denied or failed. Using default location.", error);
          loadEntities(15.4909, 73.8278);
          setLocationLoaded(true);
        }
      );
    } else {
      loadEntities(15.4909, 73.8278);
      setLocationLoaded(true);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const coords = await geocodeLocation(searchQuery);
    if (coords) {
      setUserLocation(coords);
      await loadEntities(coords.lat, coords.lng);
    } else {
      alert("Location not found. Try a different search.");
    }
    setIsSearching(false);
  };

  const filteredEntities = entities.filter(e => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Animals") return e.type === 'stray';
    if (activeFilter === "Vets") return e.type === 'vet';
    if (activeFilter === "NGOs") return e.type === 'ngo';
    if (activeFilter === "User Posts") return e.type === 'post';
    return true;
  });

  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
      <div className="mb-8 flex flex-col justify-between items-start gap-4">
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2">
              Local Rescue Network
            </h2>
            <p className="text-on-surface-variant text-[16px]">
              Real-time interactive tracking of stray reports and rescue centers near you.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="text" 
                placeholder="Search location (e.g. Goa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <Button size="sm" onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap w-full">
          {["All", "Animals", "Vets", "NGOs", "User Posts"].map((filter) => (
            <Button 
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
          <Button variant="secondary" size="sm" className="gap-2 ml-auto">
            <MapPin size={16} /> Report
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-surface-container shadow-level-2 h-[600px] relative">
        {!locationLoaded || isSearching ? (
           <div className="w-full h-full flex items-center justify-center bg-surface-container/20">
             <p className="text-on-surface-variant animate-pulse">{isSearching ? "Finding location..." : "Locating you..."}</p>
           </div>
        ) : (
          <MapComponent 
            entities={filteredEntities} 
            onSelectEntity={(entity) => setSelectedEntity(entity)}
            centerLat={userLocation.lat}
            centerLng={userLocation.lng}
          />
        )}
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
