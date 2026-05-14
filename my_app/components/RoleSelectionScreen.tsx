"use client";
import React from "react";
import { User, Building2, PawPrint } from "lucide-react";

interface RoleSelectionScreenProps {
  onSelectRole: (role: "owner" | "ngo") => void;
}

export default function RoleSelectionScreen({ onSelectRole }: RoleSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center font-sans text-white px-4 selection:bg-primary/30">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-primary opacity-80 hover:opacity-100 transition-opacity">
        <PawPrint size={32} />
        <span className="font-bold text-2xl tracking-tight">PawSense</span>
      </div>

      <div className="animate-fade-in flex flex-col items-center w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight text-center">
          Who's logging in?
        </h1>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16 justify-center items-center w-full">

          {/* Pet Owner Profile */}
          <button
            onClick={() => onSelectRole("owner")}
            className="group flex flex-col items-center gap-4 transition-all"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl bg-[#333] border-4 border-transparent group-hover:border-primary transition-all flex items-center justify-center overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
              <User size={80} className="text-white/70 group-hover:text-white transition-colors relative z-20 group-hover:scale-110 duration-300" />
            </div>
            <span className="text-xl md:text-2xl font-medium text-white/70 group-hover:text-white transition-colors">
              General User
            </span>
          </button>

          {/* NGO Profile */}
          <button
            onClick={() => onSelectRole("ngo")}
            className="group flex flex-col items-center gap-4 transition-all"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-xl bg-[#333] border-4 border-transparent group-hover:border-error transition-all flex items-center justify-center overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-error/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
              <Building2 size={80} className="text-white/70 group-hover:text-white transition-colors relative z-20 group-hover:scale-110 duration-300" />
            </div>
            <span className="text-xl md:text-2xl font-medium text-white/70 group-hover:text-white transition-colors">
              NGO / Shelter
            </span>
          </button>

        </div>

        <button className="mt-16 px-6 py-2 border border-white/40 text-white/60 hover:text-white hover:border-white uppercase tracking-widest text-sm font-medium transition-all">
          Manage Profiles
        </button>
      </div>
    </div>
  );
}
