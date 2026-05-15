"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import HomeFeed from "@/components/HomeFeed";
import RescueMap from "@/components/RescueMap";
import WellnessTab from "@/components/WellnessTab";
import WellnessCalendar from "@/components/WellnessCalendar";
import HeroSection from "@/components/HeroSection";

import CommunityTab from "@/components/CommunityTab";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthModalOpen(true);
      }
    };
    checkUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <div className="flex justify-center gap-6 xl:gap-8 px-4 max-w-7xl mx-auto w-full relative items-start pt-6">
               <div className="w-full max-w-[600px] mt-0 xl:mt-0">
                 <HomeFeed onAddPin={(pin) => setGlobalPins(prev => [...prev, pin])} />
               </div>
            </div>
          </>
        );
      case "map":
        return <RescueMap />;
      case "wellness":
        return <WellnessTab />;
      case "calendar":
        return <WellnessCalendar />;
      case "community":
        return <CommunityTab />;

      default:
        return <HeroSection />;
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "ngo") {
      window.location.href = "/ngo";
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />
      <div className="max-w-container mx-auto pb-20">
        {renderContent()}
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </main>
  );
}
