"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Syringe,
  HeartPulse,
} from "lucide-react";
import { Button } from "./ui/button";

export default function WellnessCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12 mb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2">
            Global Wellness Calendar
          </h2>
          <p className="text-on-surface-variant text-[16px]">
            Breed-specific health alerts and schedule.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-surface-container">
            {days.map((day) => (
              <div
                key={day}
                className="py-4 text-center text-sm font-semibold text-on-surface-variant border-r border-surface-container last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-2 auto-rows-[120px] bg-surface-container-low">
            {/* Mock calendar grid based on 8px spacing */}
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="border-r border-b border-surface-container last:border-r-0 p-2 bg-surface-container-lowest"
              >
                <div className="text-right text-xs text-on-surface-variant font-medium mb-1">
                  {i + 1}
                </div>
                {i === 2 && (
                  <div className="bg-primary/10 border-l-2 border-primary rounded-sm p-1.5 mb-1 cursor-pointer hover:bg-primary/20 transition-colors">
                    <p className="text-[10px] font-semibold text-primary flex items-center gap-1">
                      <Syringe size={10} /> Rabies Booster
                    </p>
                    <p className="text-[9px] text-on-surface-variant truncate">
                      For Golden Retrievers
                    </p>
                  </div>
                )}
                {i === 9 && (
                  <div className="bg-secondary/10 border-l-2 border-secondary rounded-sm p-1.5 cursor-pointer hover:bg-secondary/20 transition-colors">
                    <p className="text-[10px] font-semibold text-secondary flex items-center gap-1">
                      <HeartPulse size={10} /> Cardiac Screen
                    </p>
                    <p className="text-[9px] text-on-surface-variant truncate">
                      Senior Felines
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
