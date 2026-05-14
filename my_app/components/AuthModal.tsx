"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { X, Mail, Lock, User, Github, Check } from "lucide-react"; // Using Github icon as a placeholder for OAuth if needed, or just text

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-level-2 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            {mode === "login" 
              ? "Enter your details to access your account." 
              : "Join PawSense to start rescuing and adopting."}
          </p>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
              />
            </div>

            {mode === "signup" && (
              <div className="relative">
                <Check className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <select defaultValue="" className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all text-on-surface-variant appearance-none cursor-pointer">
                  <option value="" disabled>Select Primary Interest</option>
                  <option value="adopt">Looking to Adopt</option>
                  <option value="rescue">Volunteer / Rescuer</option>
                  <option value="ngo">NGO / Shelter</option>
                  <option value="owner">Pet Owner</option>
                </select>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button className="text-xs font-bold text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button 
              className="w-full py-6 rounded-xl font-bold shadow-level-1 mt-2"
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
            >
              {mode === "login" ? "Log in" : "Sign up"}
            </Button>
          </div>

          <div className="mt-6 mb-6 relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container"></div>
            </div>
            <span className="relative bg-surface-container-lowest px-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 py-3 border border-surface-container rounded-xl hover:bg-surface-container transition-colors text-sm font-bold text-on-surface"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button 
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 py-3 border border-surface-container rounded-xl hover:bg-surface-container transition-colors text-sm font-bold text-on-surface"
            >
              <img src="https://www.svgrepo.com/show/448239/apple.svg" alt="Apple" className="w-5 h-5 opacity-80" />
              Apple
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-bold text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
