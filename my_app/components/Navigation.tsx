"use client";
import React, { useState } from "react";
import { PawPrint, User, Calendar, CreditCard, ChevronDown, LogOut, Heart } from "lucide-react";
import { Button } from "./ui/button";
import AuthModal from "./AuthModal";
import ProfileDetailModal, { ProfileDetailType } from "./ProfileDetailModal";
import { supabase } from "@/lib/supabase";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNGO?: boolean;
}

export default function Navigation({ activeTab, setActiveTab, isNGO }: NavigationProps) {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [pets, setPets] = React.useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);

        // Fetch user's first pet for dropdown status
        const { data: petsData } = await supabase
          .from('my_pets')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        setPets(petsData || []);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profile);

        const { data: petsData } = await supabase
          .from('my_pets')
          .select('*')
          .eq('user_id', session.user.id)
          .limit(1);
        setPets(petsData || []);
      } else {
        setUser(null);
        setProfile(null);
        setPets([]);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = isNGO ? [
    { id: "ngo", label: "Home" },
    { id: "map", label: "Map" }
  ] : [
    { id: "home", label: "Home" },
    { id: "map", label: "Map" },
    { id: "wellness", label: "Wellness" },
    { id: "calendar", label: "Calendar" },
    { id: "community", label: "Community" },
    { id: "shop", label: "Shop" },
  ];

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [detailModalType, setDetailModalType] = useState<ProfileDetailType>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openProfileDetail = (type: ProfileDetailType) => {
    setDetailModalType(type);
    setIsDetailModalOpen(true);
    setIsProfileOpen(false); // Close dropdown when opening modal
  };

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest border-b border-surface-container/50 shadow-level-1/50">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 text-primary cursor-pointer"
          onClick={() => setActiveTab("home")}
        >
          <PawPrint size={28} className="text-primary" />
          <span className="font-sans font-bold text-xl tracking-tight text-on-surface">
            PawSense
          </span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${
                activeTab === item.id
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary font-medium"
              } text-sm transition-all pb-1`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex gap-4 items-center relative">
          {isLoggedIn ? (
            <div>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-surface-container py-1 px-2 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.display_name?.charAt(0) || "U"
                  )}
                </div>
                <ChevronDown size={16} className="text-on-surface-variant" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-surface-container shadow-level-2 rounded-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-surface-container/50 mb-1">
                    <p className="text-sm font-bold text-on-surface">{profile?.display_name || "User"}</p>
                    <p className="text-xs text-on-surface-variant">{user?.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => openProfileDetail("my_pet")}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <PawPrint size={16} className="text-primary" />
                    <div className="text-left">
                      <span className="block font-medium">My Pet</span>
                      <span className="block text-[10px] text-on-surface-variant leading-tight">
                        {pets.length > 0 ? `${pets[0].name} • ${pets[0].breed}` : "No pets added"}
                      </span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => openProfileDetail("health_vault")}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <User size={16} className="text-secondary" />
                    Health Vault
                  </button>
                  
                  <button 
                    onClick={() => openProfileDetail("calendar")}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <Calendar size={16} className="text-tertiary" />
                    Calendar (Schedules)
                  </button>
                  
                  <button 
                    onClick={() => openProfileDetail("finances")}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <CreditCard size={16} className="text-on-surface-variant" />
                    Finances (Orders)
                  </button>

                  <button 
                    onClick={() => openProfileDetail("breeding_requests")}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <div className="relative">
                      <Heart size={16} className="text-error" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></div>
                    </div>
                    Breeding Requests
                  </button>

                  <button 
                    onClick={() => openProfileDetail("adoption_requests")}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <div className="relative">
                      <PawPrint size={16} className="text-primary" />
                    </div>
                    Adoption Requests
                  </button>

                  <div className="border-t border-surface-container/50 mt-1 pt-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-3 transition-colors"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden md:inline-flex h-10 px-4"
                onClick={() => openAuth("login")}
              >
                Log in
              </Button>
              <Button 
                size="sm"
                onClick={() => openAuth("signup")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
      {mounted && isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authMode}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      )}
      {mounted && isDetailModalOpen && (
        <ProfileDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          type={detailModalType}
        />
      )}
    </header>
  );
}
