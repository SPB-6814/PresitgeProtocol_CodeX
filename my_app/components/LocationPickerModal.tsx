"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { X, MapPin, Search } from "lucide-react";
import { Button } from "./ui/button";

const DynamicLocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-container/20 animate-pulse flex items-center justify-center">
      <p className="text-on-surface-variant font-medium">Loading Map...</p>
    </div>
  ),
});

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address: string) => void;
}

export default function LocationPickerModal({ isOpen, onClose, onConfirm }: LocationPickerModalProps) {
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const newCoords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setMapCenter(newCoords);
        // Also auto-select it
        setSelectedCoords(newCoords);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search failed", error);
      alert("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      // In a real app, you would reverse-geocode to get an address. 
      // Here, we provide a mock address based on coordinates or a generic one.
      const mockAddress = `Selected Location (${selectedCoords.lat.toFixed(2)}, ${selectedCoords.lng.toFixed(2)})`;
      onConfirm(selectedCoords.lat, selectedCoords.lng, mockAddress);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-level-2 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[600px] border border-surface-container/50">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container bg-surface-container-low flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Pin Location
              </h2>
              <p className="text-xs text-on-surface-variant">Click on the map or search to set a precise location</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="text" 
                placeholder="Search area, district, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <Button size="sm" onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-surface-container relative">
          <DynamicLocationPickerMap 
            onLocationSelect={(lat, lng) => setSelectedCoords({lat, lng})} 
            centerPoint={mapCenter}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-container bg-surface-container-lowest flex justify-between items-center">
          <div className="text-sm font-medium text-on-surface-variant">
            {selectedCoords ? (
              <span className="text-on-surface">Location selected</span>
            ) : (
              "No location selected"
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!selectedCoords} onClick={handleConfirm}>Confirm Location</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
