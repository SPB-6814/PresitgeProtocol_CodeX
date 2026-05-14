"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";

// Fix for default marker icons in Leaflet + React
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // Ignore strict mode fast-refresh errors
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

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

const getAnimalIcon = (type?: string, color: string = "#00696b") => {
  const icon = type === 'cat' ? '🐱' : type === 'dog' ? '🐶' : '🐾';
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="marker-container">
        <div class="marker-icon bg-surface-container-lowest" style="border: 2px solid ${color}; padding: 4px; border-radius: 50%;">
          <span style="font-size: 20px;">${icon}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const getServiceIcon = (type: string) => {
  const color = type === 'vet' ? '#ba1a1a' : '#00696b';
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="marker-container">
        <div class="marker-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}" stroke="white" stroke-width="1.5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  });
};

export default function MapComponent({ 
  entities = [], 
  onSelectEntity 
}: { 
  entities?: MapEntity[], 
  onSelectEntity: (entity: MapEntity) => void 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-surface-container/20 animate-pulse flex items-center justify-center">
        <p className="text-on-surface-variant font-medium">Initializing Map Layers...</p>
      </div>
    );
  }

  return (
    <MapContainer 
      center={[15.4909, 73.8278]} 
      zoom={11} 
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ResizeHandler />
      
      {entities.map((entity) => (
        <Marker 
          key={entity.id} 
          position={[entity.lat, entity.lng]} 
          icon={entity.type === 'stray' ? getAnimalIcon(entity.animal_type) : getServiceIcon(entity.type)}
          eventHandlers={{
            click: () => onSelectEntity(entity)
          }}
        >
        </Marker>
      ))}
    </MapContainer>
  );
}
