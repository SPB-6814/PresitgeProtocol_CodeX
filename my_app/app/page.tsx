"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import HomeFeed from "@/components/HomeFeed";
import RescueMap from "@/components/RescueMap";
import WellnessTab from "@/components/WellnessTab";
import HeroSection from "@/components/HeroSection";
import TriageDashboard from "@/components/TriageDashboard";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <HeroSection />
            <HomeFeed />
            <div className="mt-16">
              <TriageDashboard />
            </div>
          </>
        );
      case "map":
        return <RescueMap />;
      case "wellness":
        return <WellnessTab />;
      case "community":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant">
            <h2 className="text-2xl font-bold">Community Hub</h2>
            <p>Coming soon...</p>
          </div>
        );
      default:
        return <HeroSection />;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-container mx-auto pb-20">
        {renderContent()}
      </div>
    </main>
  );
}
