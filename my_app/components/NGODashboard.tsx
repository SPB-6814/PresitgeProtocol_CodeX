"use client";
import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin, Search, Filter, AlertTriangle, Clock, Activity, PawPrint, Loader2 } from "lucide-react";
import { geocodeLocation } from "@/lib/geocoding";
import { fetchMapEntities } from "@/lib/map-utils";

export default function NGODashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [animalFilter, setAnimalFilter] = useState("All");
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocationStr, setCurrentLocationStr] = useState("Goa (Default)");

  useEffect(() => {
    // Default load for Goa
    loadReportsForLocation(15.4909, 73.8278);
  }, []);

  const loadReportsForLocation = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const data = await fetchMapEntities(lat, lng, 50000); // 50km radius for dashboard
      
      // Filter for strays and user posts that might be relevant
      const relevantEntities = data.filter(e => e.type === 'stray' || e.type === 'post');
      setReports(relevantEntities);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const coords = await geocodeLocation(searchQuery);
    if (coords) {
      setCurrentLocationStr(searchQuery);
      await loadReportsForLocation(coords.lat, coords.lng);
    } else {
      alert("Location not found. Try a different search.");
    }
    setIsSearching(false);
  };

  const filteredReports = reports.filter(report => {
    // Filter by urgency (we'll mock urgency based on behavior tags or just default to High for strays if missing)
    const mockUrgency = report.type === 'stray' ? 'High' : 'Medium';
    const matchesUrgency = urgencyFilter === "All" || mockUrgency === urgencyFilter;

    let matchesAnimal = true;
    if (animalFilter === "Dog") {
      matchesAnimal = (report.name?.toLowerCase().includes("dog") || report.animal_type?.toLowerCase() === "dog" || report.description?.toLowerCase().includes("dog")) ?? false;
    } else if (animalFilter === "Cat") {
      matchesAnimal = (report.name?.toLowerCase().includes("cat") || report.animal_type?.toLowerCase() === "cat" || report.description?.toLowerCase().includes("cat")) ?? false;
    }

    return matchesUrgency && matchesAnimal;
  });

  return (
    <div className="pt-8 px-4 animate-fade-in max-w-7xl mx-auto pb-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
          <Activity className="text-error" size={32} /> NGO Rescue Portal
        </h1>
        <p className="text-on-surface-variant text-lg">
          Live database of stray animal reports and treatments near <span className="font-bold text-primary">{currentLocationStr}</span>.
        </p>
      </div>

      {/* Controls: Search and Filters */}
      <Card className="p-4 mb-8 border-surface-container bg-surface-container-lowest flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex gap-2 flex-[2]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              type="text" 
              placeholder="Search by city, region, or address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-background focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="py-6 px-6 rounded-xl font-bold shadow-level-1">
            {isSearching ? "Locating..." : "Find Reports"}
          </Button>
        </div>
        
        <div className="flex gap-4 flex-1">
          <div className="flex items-center gap-2 bg-background border border-surface-container rounded-xl px-3 flex-1 md:flex-none">
            <Filter size={18} className="text-on-surface-variant shrink-0" />
            <select 
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="py-3 bg-transparent focus:outline-none w-full cursor-pointer text-on-surface"
            >
              <option value="All">All Urgencies</option>
              <option value="High">High Urgency</option>
              <option value="Medium">Medium Urgency</option>
              <option value="Low">Low Urgency</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-background border border-surface-container rounded-xl px-3 flex-1 md:flex-none">
            <PawPrint size={18} className="text-on-surface-variant shrink-0" />
            <select 
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              className="py-3 bg-transparent focus:outline-none w-full cursor-pointer text-on-surface"
            >
              <option value="All">All Animals</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading || isSearching ? (
        <div className="flex flex-col items-center justify-center py-32 bg-surface-container-low/50 rounded-3xl border border-surface-container/50">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-on-surface-variant font-medium">Scanning area for reported animals...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const urgency = report.type === 'stray' ? 'High' : 'Medium';
              return (
                <Card key={report.id} className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow border-t-4 border-t-error">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container shrink-0">
                          {report.image_url ? (
                            <img src={report.image_url} alt="Reported Animal" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-on-surface-variant text-xs font-bold">No Img</div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-on-surface">{report.name || "Unknown Animal"}</h3>
                          <p className="text-sm text-on-surface-variant capitalize">{report.animal_type || "Unknown Breed"}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                        urgency === 'High' ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'
                      }`}>
                        <AlertTriangle size={14} /> {urgency}
                      </span>
                    </div>

                    <div className="bg-error/5 p-4 rounded-xl mb-4 border border-error/10 flex-1">
                      <p className="text-sm font-medium text-on-surface leading-relaxed">
                        "{report.description || "No specific details provided."}"
                      </p>
                    </div>

                    <div className="space-y-2 mb-6 mt-auto">
                      <p className="text-sm text-on-surface-variant flex items-start gap-2">
                        <MapPin size={16} className="shrink-0 mt-0.5" /> 
                        <span className="font-medium text-on-surface">Coords: {report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}</span>
                      </p>
                      <p className="text-sm text-on-surface-variant flex items-center gap-2">
                        <Clock size={16} className="shrink-0" /> 
                        {report.type === 'stray' ? 'Stray Report' : 'Community Post'}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <Button className="flex-1 font-bold bg-error hover:bg-error/90 text-on-error">
                        Accept Rescue
                      </Button>
                      <Button variant="outline" className="flex-1 font-bold">
                        View on Map
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant">
              <Activity size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">No stray reports match your filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
