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

export interface UserPin {
  id: string;
  lat: number;
  lng: number;
  name: string;
  description: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [globalPins, setGlobalPins] = useState<UserPin[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <div className="flex justify-center gap-6 xl:gap-8 px-4 max-w-7xl mx-auto w-full relative items-start pt-6">
               <HomeLeftSidebar />
               <div className="w-full max-w-[600px] mt-0 xl:mt-0">
                 <HomeFeed onAddPin={(pin) => setGlobalPins(prev => [...prev, pin])} />
               </div>
               <HomeSidebar setActiveTab={setActiveTab} />
            </div>
          </>
        );
      case "map":
        return <RescueMap userPins={globalPins} />;
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
