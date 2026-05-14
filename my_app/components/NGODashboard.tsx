"use client";
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { MapPin, Search, Filter, AlertTriangle, Clock, Activity, PawPrint } from "lucide-react";
import { PETS_DATA } from "@/lib/data";

export default function NGODashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [animalFilter, setAnimalFilter] = useState("All");

  const strayReports = PETS_DATA.filter(p => p.type === "stray_report");

  const filteredReports = strayReports.filter(report => {
    // Search by pet name, breed, or issue description
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (report.petName && report.petName.toLowerCase().includes(query)) ||
      (report.breed && report.breed.toLowerCase().includes(query)) ||
      (report.issue && report.issue.toLowerCase().includes(query)) ||
      (report.location && report.location.toLowerCase().includes(query));

    // Filter by urgency
    const matchesUrgency = urgencyFilter === "All" || report.urgency === urgencyFilter;

    // Filter by animal type (simple check based on petName or breed for demo)
    let matchesAnimal = true;
    if (animalFilter === "Dog") {
      matchesAnimal = (report.petName?.toLowerCase().includes("dog") || report.breed?.toLowerCase().includes("dog") || report.petName?.toLowerCase().includes("puppy")) ?? false;
    } else if (animalFilter === "Cat") {
      matchesAnimal = (report.petName?.toLowerCase().includes("cat") || report.breed?.toLowerCase().includes("cat") || report.petName?.toLowerCase().includes("kitten")) ?? false;
    }

    return matchesSearch && matchesUrgency && matchesAnimal;
  });

  return (
    <div className="pt-8 px-4 animate-fade-in max-w-7xl mx-auto pb-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
          <Activity className="text-error" size={32} /> NGO Rescue Portal
        </h1>
        <p className="text-on-surface-variant text-lg">
          Live database of stray animal reports requiring immediate attention.
        </p>
      </div>

      {/* Controls: Search and Filters */}
      <Card className="p-4 mb-8 border-surface-container bg-surface-container-lowest flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            placeholder="Search by description, animal type, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-background focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all"
          />
        </div>
        
        <div className="flex gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow border-t-4 border-t-error">
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container shrink-0">
                    <img src={report.image} alt="Reported Animal" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{report.petName}</h3>
                    <p className="text-sm text-on-surface-variant">{report.breed}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                  report.urgency === 'High' ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'
                }`}>
                  <AlertTriangle size={14} /> {report.urgency}
                </span>
              </div>

              <div className="bg-error/5 p-4 rounded-xl mb-4 border border-error/10">
                <p className="text-sm font-medium text-on-surface leading-relaxed">
                  "{report.issue}"
                </p>
              </div>

              <div className="space-y-2 mb-6 mt-auto">
                <p className="text-sm text-on-surface-variant flex items-start gap-2">
                  <MapPin size={16} className="shrink-0 mt-0.5" /> 
                  <span className="font-medium text-on-surface">{report.location}</span>
                </p>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <Clock size={16} className="shrink-0" /> 
                  Reported {report.reportTime} by {report.reporterName}
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
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-20 text-on-surface-variant">
          <Activity size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl font-medium">No stray reports match your filters.</p>
        </div>
      )}
    </div>
  );
}
