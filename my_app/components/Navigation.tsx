"use client";
import React from "react";
import { PawPrint } from "lucide-react";
import { Button } from "./ui/button";

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest border-b border-surface-container/50 shadow-level-1/50">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <PawPrint size={28} className="text-primary" />
          <span className="font-sans font-bold text-xl tracking-tight text-on-surface">
            PawSense
          </span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors"
          >
            Triage
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors"
          >
            Rescue Map
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors"
          >
            Wellness
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors"
          >
            Community
          </a>
        </nav>
        <div className="flex gap-4 items-center">
          <Button variant="ghost" className="hidden md:inline-flex h-10 px-4">
            Log in
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}
