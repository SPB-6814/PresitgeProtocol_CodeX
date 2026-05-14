"use client";
import React from "react";
import { X, PawPrint, User, Calendar, CreditCard, Heart } from "lucide-react";
import { Button } from "./ui/button";

import MyPetsManager from "./MyPetsManager";

export type ProfileDetailType = "my_pet" | "health_vault" | "calendar" | "finances" | "breeding_requests" | null;

interface ProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ProfileDetailType;
}

export default function ProfileDetailModal({ isOpen, onClose, type }: ProfileDetailModalProps) {
  if (!isOpen || !type) return null;

  const renderContent = () => {
    switch (type) {
      case "my_pet":
        return <MyPetsManager />;
      case "health_vault":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><User size={20} className="text-secondary" /> Health Records</h3>
            <div className="space-y-3">
              <div className="p-3 border border-surface-container rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Rabies Vaccination</p>
                  <p className="text-xs text-on-surface-variant">Administered: Oct 12, 2025</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Valid</span>
              </div>
              <div className="p-3 border border-surface-container rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Annual Checkup</p>
                  <p className="text-xs text-on-surface-variant">Administered: Aug 5, 2025</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">View Notes</Button>
              </div>
            </div>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} className="text-tertiary" /> Upcoming Schedules</h3>
            <div className="p-4 bg-tertiary/5 border border-tertiary/20 rounded-xl relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
               <p className="font-bold text-sm text-tertiary">Grooming Appointment</p>
               <p className="text-xs text-on-surface mb-2">Tomorrow at 10:00 AM</p>
               <p className="text-[10px] text-on-surface-variant">Bark & Bubble Salon</p>
            </div>
            <div className="p-4 border border-surface-container rounded-xl relative overflow-hidden">
               <p className="font-bold text-sm text-on-surface">Flea & Tick Medication</p>
               <p className="text-xs text-on-surface mb-2">In 5 Days</p>
               <Button variant="secondary" size="sm" className="w-full text-xs h-7">Mark as Done</Button>
            </div>
          </div>
        );
      case "finances":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard size={20} className="text-on-surface-variant" /> Order History</h3>
            <div className="space-y-3">
              <div className="p-3 border border-surface-container rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Premium Puppy Kibble</p>
                  <p className="text-xs text-on-surface-variant">Ordered: May 1, 2026</p>
                </div>
                <span className="font-bold text-sm">$45.99</span>
              </div>
              <div className="p-3 border border-surface-container rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Interactive Laser Toy</p>
                  <p className="text-xs text-on-surface-variant">Ordered: Apr 15, 2026</p>
                </div>
                <span className="font-bold text-sm">$15.00</span>
              </div>
            </div>
          </div>
        );
      case "breeding_requests":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Heart size={20} className="text-error fill-error/20" /> Breeding Requests</h3>
            <div className="p-4 border border-surface-container shadow-sm rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-low overflow-hidden">
                  <img src="/pet2.png" alt="Luna" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm">Luna (Golden Retriever)</p>
                  <p className="text-xs text-on-surface-variant">Requested by: Sarah J.</p>
                </div>
              </div>
              <p className="text-xs text-on-surface leading-relaxed mb-3 bg-surface-container-lowest p-2 rounded">
                "Hi! Buddy looks like a great match for Luna. We have all health clearances. Let's connect!"
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 h-8 text-xs bg-error text-on-error hover:bg-error/90">Accept</Button>
                <Button variant="outline" className="flex-1 h-8 text-xs">Decline</Button>
              </div>
            </div>
          </div>
        );
      default:
        return <p>Content not found.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-level-2 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border border-surface-container/50">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
