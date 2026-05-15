"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import NGODashboard from "@/components/NGODashboard";

import RescueMap from "@/components/RescueMap";
import CommunityTab from "@/components/CommunityTab";
import { supabase } from "@/lib/supabase";

export default function NGOPage() {
  const [activeTab, setActiveTab] = useState("ngo");

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/";
      }
    };
    checkUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "ngo":
        return <NGODashboard />;
      case "map":
        return <RescueMap />;
      case "community":
        return <CommunityTab />;
      default:
        return <NGODashboard />;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isNGO />
      <div className="max-w-container mx-auto pb-20">
        {renderContent()}
      </div>
    </main>
  );
}
