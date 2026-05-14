"use client";
import React, { useState, useEffect } from "react";
import RoleSelectionScreen from "./RoleSelectionScreen";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setRole(storedRole);
    }
    setIsLoaded(true);
  }, []);

  const handleSelectRole = (selectedRole: "owner" | "ngo") => {
    localStorage.setItem("userRole", selectedRole);
    setRole(selectedRole);
    
    // Redirect to appropriate starting page for the selected role
    if (selectedRole === "ngo") {
      window.location.href = "/ngo";
    } else {
      window.location.href = "/";
    }
  };

  // Prevent hydration mismatch by not rendering anything until localStorage is checked
  if (!isLoaded) return null;

  // Force the selection screen if no role is chosen yet
  if (!role) {
    return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
  }

  // Once a role is selected, render the actual app
  return <>{children}</>;
}
