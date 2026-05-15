"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Syringe,
  Scissors,
  Calendar as CalendarIcon,
  Loader2,
  PawPrint
} from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";

interface Pet {
  id: string;
  name: string;
  animal_type: string;
  monthly_schedule: Record<string, { type: string; title: string; desc: string }[]> | null;
}

export default function WellnessCalendar() {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("my_pets")
        .select("id, name, animal_type, monthly_schedule")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPets(data || []);
      if (data && data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (error) {
      console.error("Error fetching pets for calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate 30 days for a mock month view
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12 mb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2 flex items-center gap-3">
            <CalendarIcon className="text-primary" size={32} />
            Wellness Calendar
          </h2>
          <p className="text-on-surface-variant text-[16px]">
            AI-generated grooming and health schedules for your pets.
          </p>
        </div>
        <div className="flex gap-2">
          {pets.map((pet) => (
            <Button 
              key={pet.id}
              variant={selectedPet?.id === pet.id ? "default" : "outline"}
              className="rounded-full gap-2"
              onClick={() => setSelectedPet(pet)}
            >
              <PawPrint size={16} /> {pet.name}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : pets.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-surface-container bg-surface-container-lowest shadow-none">
          <p className="text-on-surface-variant font-medium">No pets added yet.</p>
          <p className="text-xs text-on-surface-variant mt-1">Add a pet in the Profile section to view their wellness calendar.</p>
        </Card>
      ) : !selectedPet?.monthly_schedule ? (
        <Card className="p-12 text-center border-dashed border-surface-container bg-surface-container-lowest shadow-none">
          <p className="text-on-surface-variant font-medium">No AI schedule generated yet for {selectedPet?.name}.</p>
          <p className="text-xs text-on-surface-variant mt-1">Go to your pet's profile and click "Get AI Insights" to generate a personalized calendar.</p>
        </Card>
      ) : (
        <Card className="border-surface-container shadow-level-2 overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-container bg-surface-container-lowest">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                This Month's Schedule <span className="text-sm font-normal text-on-surface-variant ml-2">for {selectedPet.name}</span>
              </h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ChevronLeft size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-surface-container bg-surface-container-lowest">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-bold uppercase text-on-surface-variant border-r border-surface-container last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 auto-rows-[120px] bg-surface-container-low gap-[1px]">
              {calendarDays.map((day) => {
                const dayEvents = selectedPet.monthly_schedule?.[day.toString()] || [];
                const healthEvents = dayEvents.filter(e => e.type === 'health');
                const groomingEvents = dayEvents.filter(e => e.type === 'grooming');
                const hasEvents = dayEvents.length > 0;
                
                let bgClass = "bg-surface-container-lowest/50";
                if (hasEvents) {
                  if (healthEvents.length > 0 && groomingEvents.length === 0) {
                    bgClass = "bg-gradient-to-br from-surface-container-lowest to-primary/5 border border-primary/10";
                  } else if (groomingEvents.length > 0 && healthEvents.length === 0) {
                    bgClass = "bg-gradient-to-br from-surface-container-lowest to-secondary/5 border border-secondary/10";
                  } else {
                    bgClass = "bg-gradient-to-br from-primary/5 via-surface-container-lowest to-secondary/5 border border-primary/10";
                  }
                }
                
                return (
                  <div
                    key={day}
                    className={`relative p-2 transition-all duration-300 group cursor-default rounded-sm ${
                      hasEvents 
                        ? `${bgClass} hover:shadow-level-1 z-10 hover:z-20` 
                        : bgClass
                    }`}
                  >
                    {/* Background Watermark Icons (Clipped to cell) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm">
                      {healthEvents.length > 0 && groomingEvents.length === 0 && (
                        <Syringe className="absolute -bottom-2 -left-2 text-primary/[0.03] w-20 h-20 rotate-[-15deg] transition-transform group-hover:scale-110 duration-500" />
                      )}
                      {groomingEvents.length > 0 && healthEvents.length === 0 && (
                        <Scissors className="absolute -bottom-2 -left-2 text-secondary/[0.03] w-20 h-20 rotate-[-15deg] transition-transform group-hover:scale-110 duration-500" />
                      )}
                      {healthEvents.length > 0 && groomingEvents.length > 0 && (
                        <>
                          <Syringe className="absolute -top-4 -left-2 text-primary/[0.03] w-16 h-16 rotate-[15deg] transition-transform group-hover:scale-110 duration-500" />
                          <Scissors className="absolute -bottom-4 -right-2 text-secondary/[0.03] w-16 h-16 rotate-[-15deg] transition-transform group-hover:scale-110 duration-500" />
                        </>
                      )}
                    </div>

                    <div className={`relative z-10 text-right text-sm font-medium mb-2 ${hasEvents ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                      {day}
                    </div>
                    
                    {/* Visual Indicators (Aesthetic Badges) */}
                    {hasEvents && (
                      <div className="relative z-10 flex flex-col gap-2 items-center justify-center mt-2">
                        {healthEvents.length > 0 && (
                          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold shadow-sm border border-primary/20 backdrop-blur-sm">
                            <Syringe size={12} /> <span className="hidden sm:inline">{healthEvents.length} Health</span>
                          </div>
                        )}
                        {groomingEvents.length > 0 && (
                          <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs font-bold shadow-sm border border-secondary/20 backdrop-blur-sm">
                            <Scissors size={12} /> <span className="hidden sm:inline">{groomingEvents.length} Groom</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Smooth Unified Hover Tooltip */}
                    {hasEvents && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[240px] bg-surface-container-highest shadow-level-4 rounded-xl z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none overflow-hidden border border-surface-container">
                        <div className="bg-primary/5 px-3 py-2 border-b border-surface-container">
                          <p className="text-xs font-bold text-on-surface">Day {day} Schedule</p>
                        </div>
                        <div className="p-3 space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                          {dayEvents.map((event, idx) => {
                            const isHealth = event.type === 'health';
                            return (
                              <div key={idx} className="flex gap-2 items-start">
                                <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${isHealth ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                  {isHealth ? <Syringe size={12} /> : <Scissors size={12} />}
                                </div>
                                <div>
                                  <p className={`text-xs font-bold leading-tight mb-0.5 ${isHealth ? 'text-primary' : 'text-secondary'}`}>
                                    {event.title}
                                  </p>
                                  <p className="text-[11px] text-on-surface-variant leading-snug">{event.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
