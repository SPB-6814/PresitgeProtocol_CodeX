"use client";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Map, MapPin, Syringe, Shield, Info } from "lucide-react";
import { Button } from "./ui/button";

export default function RescueMap() {
  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2">
            Stray Rescue Network
          </h2>
          <p className="text-on-surface-variant text-[16px]">
            Real-time coordination for stray reporting, rescue, and vet care.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="bg-surface-container">
            Filter Area
          </Button>
          <Button variant="secondary" className="gap-2">
            <MapPin size={18} /> Report Stray
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-level-2">
        <div className="relative w-full h-[500px] bg-[#e8eff1] flex items-center justify-center">
          {/* Abstract Map Background Mockup */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#00696b 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          <Map size={64} className="text-outline-variant/30 absolute" />

          {/* Map Pins Mockups */}
          <div className="absolute top-[20%] left-[30%]">
            <div className="relative group cursor-pointer">
              <MapPin
                size={32}
                className="text-primary drop-shadow-md"
                fill="#ffffff"
              />
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface-container-lowest p-3 rounded-DEFAULT shadow-level-3 min-w-[200px] z-10 hidden group-hover:block border border-surface-container">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-on-surface">
                    Community Dog (Max)
                  </h4>
                </div>
                <div className="flex gap-1 flex-wrap mb-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary"
                  >
                    <Syringe size={10} className="mr-1" /> Vaccinated
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    <Shield size={10} className="mr-1" /> Neutered
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-2">
                  <Info size={12} /> Last fed 2 hrs ago by @sarah
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-[45%] right-[25%]">
            <div className="relative group cursor-pointer">
              <MapPin
                size={32}
                className="text-secondary drop-shadow-md animate-bounce"
                fill="#ffffff"
              />
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface-container-lowest p-3 rounded-DEFAULT shadow-level-3 min-w-[200px] z-10 hidden group-hover:block border border-error/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-error">
                    Injured Feline
                  </h4>
                  <span className="text-[10px] text-error-container bg-error px-1.5 py-0.5 rounded-sm font-bold">
                    URGENT
                  </span>
                </div>
                <p className="text-xs text-on-surface mb-2">
                  Reported limping, needs transport to Central Vet.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full h-8 text-xs"
                >
                  Volunteer to Transport
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[30%] left-[45%]">
            <div className="relative group cursor-pointer">
              <MapPin
                size={32}
                className="text-outline drop-shadow-md"
                fill="#ffffff"
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
