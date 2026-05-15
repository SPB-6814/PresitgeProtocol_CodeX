"use client";
import React, { useState } from "react";
import { Search, Upload, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import TriageReport from "./TriageReport";

export default function WellnessTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<null | {
    status: "healthy" | "warning" | "alert";
    message: string;
    recommendation: string;
  }>(null);

  const handleDiagnosticUpload = () => {
    setIsUploading(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsUploading(false);
      setDiagnosticResult({
        status: "warning",
        message: "Mild skin irritation detected in the abdominal area.",
        recommendation: "Keep the area clean and dry. Monitor for increased redness. If irritation persists for more than 48 hours, consult a veterinarian."
      });
    }, 2000);
  };

  return (
    <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-on-surface mb-4">Pet Wellness & Diagnostics</h1>
        <p className="text-on-surface-variant text-lg">
          Search for pet health information or upload a photo for an instant AI health check.
        </p>
      </div>

      {/* AI Symptom Triage */}
      <div className="max-w-4xl mx-auto mb-16">
        <TriageReport />
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Diagnostic Upload */}
        <Card className="p-8 border-dashed border-2 border-primary/30 bg-primary/[0.02] flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Upload size={32} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">AI Visual Diagnostic</h2>
          <p className="text-on-surface-variant mb-8">
            Upload a clear photo of the affected area (skin, eyes, paws) for an instant AI analysis.
          </p>
          
          <input type="file" id="pet-photo" className="hidden" onChange={handleDiagnosticUpload} />
          <Button 
            size="lg" 
            className="w-full max-w-xs"
            onClick={() => document.getElementById('pet-photo')?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Analyzing Photo..." : "Upload Photo"}
          </Button>
          <p className="mt-4 text-xs text-on-surface-variant">
            Supported formats: JPG, PNG. Max size 10MB.
          </p>
        </Card>

        {/* Diagnostic Results */}
        <div className="space-y-6">
          {diagnosticResult ? (
            <Card className={`p-6 border-l-4 ${
              diagnosticResult.status === 'warning' ? 'border-secondary bg-secondary/[0.03]' : 
              diagnosticResult.status === 'alert' ? 'border-error bg-error/[0.03]' : 'border-primary bg-primary/[0.03]'
            }`}>
              <div className="flex gap-4 items-start">
                {diagnosticResult.status === 'warning' ? <AlertCircle className="text-secondary shrink-0" size={24} /> : 
                 diagnosticResult.status === 'alert' ? <AlertCircle className="text-error shrink-0" size={24} /> : 
                 <CheckCircle2 className="text-primary shrink-0" size={24} />}
                <div>
                  <h3 className="font-bold text-on-surface text-lg mb-1">Analysis Complete</h3>
                  <p className="text-on-surface-variant mb-4">{diagnosticResult.message}</p>
                  
                  <div className="bg-white/50 rounded-xl p-4 border border-surface-container/50">
                    <div className="flex gap-2 items-center text-primary font-bold text-sm mb-2">
                      <Info size={16} />
                      <span>Recommendation</span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {diagnosticResult.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest rounded-3xl border border-surface-container/50 border-dashed">
              <p className="text-on-surface-variant italic">
                Upload a photo to see AI-powered health insights here.
              </p>
            </div>
          )}
          
          {/* Quick Tips */}
          <Card className="p-6">
            <h3 className="font-bold text-on-surface mb-4">Daily Wellness Tip</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Regular brushing doesn't just keep your pet's coat shiny—it's also a great way to check for unusual bumps or skin conditions early.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
