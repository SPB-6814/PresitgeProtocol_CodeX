"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import HomeFeed from "@/components/HomeFeed";
import RescueMap from "@/components/RescueMap";
import WellnessTab from "@/components/WellnessTab";
import HeroSection from "@/components/HeroSection";
import TriageDashboard from "@/components/TriageDashboard";
import CommunityTab from "@/components/CommunityTab";
import ShopTab from "@/components/ShopTab";
import HomeSidebar from "@/components/HomeSidebar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <HeroSection />
            <div className="flex justify-center gap-8 px-4 max-w-6xl mx-auto w-full relative items-start">
               <div className="w-full max-w-[600px]">
                 <HomeFeed />
               </div>
               <HomeSidebar setActiveTab={setActiveTab} />
            </div>
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
        return <CommunityTab />;
      case "shop":
        return <ShopTab />;
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
