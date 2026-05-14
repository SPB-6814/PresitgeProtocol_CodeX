"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet + React
// We don't strictly need this if we use our custom icons, but it's good practice
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: "active" | "urgent";
  description: string;
  reporter: string;
}

const LOCATIONS: Location[] = [
  {
    id: 1,
    name: "North Goa Shelter",
    lat: 15.5937,
    lng: 73.8122,
    status: "active",
    description: "Community shelter managing 40+ rescues. Always looking for volunteers.",
    reporter: "@sarah_c"
  },
  {
    id: 2,
    name: "Central Vet Hospital",
    lat: 15.4909,
    lng: 73.8278,
    status: "active",
    description: "24/7 emergency care center for injured strays.",
    reporter: "@vet_care"
  },
  {
    id: 3,
    name: "Urgent: Injured Feline",
    lat: 15.4026,
    lng: 73.9703,
    status: "urgent",
    description: "Severe leg injury reported. Needs transport to hospital immediately.",
    reporter: "@alex_r"
  },
  {
    id: 4,
    name: "Benaulim Rescue Point",
    lat: 15.2472,
    lng: 73.9314,
    status: "active",
    description: "Local feeding point and health check station.",
    reporter: "@beach_rescue"
  }
];

// Custom Icon Generator (Inspired by user's reference)
const createCustomIcon = (location: Location) => {
  const color = location.status === "urgent" ? "#ba1a1a" : "#00696b";
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="marker-container">
        <div class="marker-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}" stroke="white" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="marker-label">${location.name}</div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  });
};

// Component to handle map resizing
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function MapComponent() {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer 
      center={[15.4909, 73.8278]} 
      zoom={10} 
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ResizeHandler />
      {LOCATIONS.map((loc) => (
        <Marker 
          key={loc.id} 
          position={[loc.lat, loc.lng]} 
          icon={createCustomIcon(loc)}
        >
          <Popup>
            <div className="popup-content">
              <span className={`status-badge ${loc.status === 'urgent' ? 'status-urgent' : 'status-active'}`}>
                {loc.status}
              </span>
              <h3>{loc.name}</h3>
              <p>{loc.description}</p>
              <div className="flex items-center gap-2 mt-4 text-[11px] text-on-surface-variant font-medium">
                <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[8px]">
                  {loc.reporter.slice(1, 3).toUpperCase()}
                </div>
                Reported by {loc.reporter}
              </div>
            </div>
            <div className="popup-footer">
              <button className="text-xs font-bold text-primary hover:underline">
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
