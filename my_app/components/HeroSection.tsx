"use client";
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, AlertTriangle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full bg-surface-container py-16 md:py-24">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center gap-8">
        <div className="flex gap-2 items-center text-primary font-semibold tracking-wider uppercase text-sm mb-4">
          <span className="px-3 py-1 bg-primary-fixed rounded-full text-on-primary-fixed-variant">
            AI-Powered Care
          </span>
        </div>
        <h1 className="text-4xl md:text-[48px] font-bold text-on-surface leading-tight tracking-tight max-w-3xl">
          Intelligent Animal Welfare & Companion Care
        </h1>
        <p className="text-lg md:text-[18px] text-on-surface-variant max-w-2xl">
          Empowering pet owners, shelters, and rescuers with AI-driven symptom
          triage, predictive outbreak alerts, and real-time rescue coordination.
        </p>

        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search symptoms, diseases, or local shelters..."
              className="pl-12 h-14 text-base bg-surface-container-lowest"
            />
          </div>
          <Button size="lg" className="h-14">
            Assess Symptoms
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button variant="secondary" size="lg" className="h-14 gap-2">
            <AlertTriangle size={20} />
            Emergency SOS
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-14 bg-surface-container-lowest"
          >
            Report a Stray
          </Button>
        </div>
      </div>
    </section>
  );
}
