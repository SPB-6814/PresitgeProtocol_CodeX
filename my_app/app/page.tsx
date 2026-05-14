"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import HomeFeed from "@/components/HomeFeed";
import RescueMap from "@/components/RescueMap";
import WellnessTab from "@/components/WellnessTab";
import HeroSection from "@/components/HeroSection";

import CommunityTab from "@/components/CommunityTab";
import ShopTab from "@/components/ShopTab";
import HomeSidebar from "@/components/HomeSidebar";
import HomeLeftSidebar from "@/components/HomeLeftSidebar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <div className="flex justify-center gap-6 xl:gap-8 px-4 max-w-7xl mx-auto w-full relative items-start pt-6">
               <HomeLeftSidebar />
               <div className="w-full max-w-[600px] mt-0 xl:mt-0">
                 <HomeFeed />
               </div>
               <HomeSidebar setActiveTab={setActiveTab} />
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
