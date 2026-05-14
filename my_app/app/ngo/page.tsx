"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import NGODashboard from "@/components/NGODashboard";

import RescueMap from "@/components/RescueMap";
import CommunityTab from "@/components/CommunityTab";

export default function NGOPage() {
  const [activeTab, setActiveTab] = useState("ngo");

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
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-container mx-auto pb-20">
        {renderContent()}
      </div>
    </main>
  );
}
