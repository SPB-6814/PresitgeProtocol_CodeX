import React, { useState } from "react";
import { Button } from "./ui/button";
import { X, Mail, Lock, User, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        alert("Success! Please check your email to confirm your account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-level-5 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border border-surface-container">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleAuth} className="p-8">
          <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            {mode === "login" 
              ? "Enter your details to access your account." 
              : "Join the community to start rescuing and adopting."}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-xl font-bold shadow-level-1 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                mode === "login" ? "Log in" : "Sign up"
              )}
            </Button>
          </div>

          <Button 
            type="button"
            variant="outline"
            className="w-full py-6 rounded-xl font-bold border-surface-container text-on-surface-variant hover:bg-surface-container transition-all"
            onClick={onClose}
          >
            Continue as Guest
          </Button>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="font-bold text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
