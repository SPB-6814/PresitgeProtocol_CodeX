"use client";
import React, { useState } from "react";
import { Search, Upload, AlertCircle, CheckCircle2, Info, ChevronRight, Activity } from "lucide-react";
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
    possible_causes?: string[];
    actionable_steps?: string[];
    recommendation?: string;
  }>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDiagnosticUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setDiagnosticResult(null);

    try {
      // Compress image client-side before sending to API
      const base64String = await compressImage(file);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          payload: { base64Image: base64String }
        })
      });

      const data = await response.json();

        if (response.ok) {
          setDiagnosticResult({
            status: data.status || 'warning',
            message: data.message || 'Analysis complete.',
            possible_causes: data.possible_causes,
            actionable_steps: data.actionable_steps,
            recommendation: data.recommendation
          });
        } else {
          setDiagnosticResult({
            status: 'alert',
            message: 'API Error',
            actionable_steps: [data.error || 'Failed to process image.']
          });
        }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
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
            <Card className={`p-6 border-l-4 ${diagnosticResult.status === 'warning' ? 'border-secondary bg-secondary/[0.03]' :
                diagnosticResult.status === 'alert' ? 'border-error bg-error/[0.03]' : 'border-primary bg-primary/[0.03]'
              }`}>
              <div className="flex gap-4 items-start">
                {diagnosticResult.status === 'warning' ? <AlertCircle className="text-secondary shrink-0" size={24} /> :
                  diagnosticResult.status === 'alert' ? <AlertCircle className="text-error shrink-0" size={24} /> :
                    <CheckCircle2 className="text-primary shrink-0" size={24} />}
                <div>
                  <h3 className="font-bold text-on-surface text-lg mb-1">Analysis Complete</h3>
                  <p className="text-on-surface-variant mb-4">{diagnosticResult.message}</p>

                  {diagnosticResult.possible_causes && diagnosticResult.possible_causes.length > 0 && (
                    <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container/50 mb-4">
                      <div className="flex gap-2 items-center text-secondary font-bold text-sm mb-2">
                        <Activity size={16} />
                        <span>Possible Causes</span>
                      </div>
                      <ul className="space-y-1">
                        {diagnosticResult.possible_causes.map((cause, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-on-surface-variant text-sm">
                            <span className="text-secondary shrink-0 mt-1">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {diagnosticResult.actionable_steps && diagnosticResult.actionable_steps.length > 0 && (
                    <div className="bg-primary/[0.05] rounded-xl p-4 border border-primary/20">
                      <div className="flex gap-2 items-center text-primary font-bold text-sm mb-3">
                        <CheckCircle2 size={16} />
                        <span>Actionable Steps</span>
                      </div>
                      <ul className="space-y-2">
                        {diagnosticResult.actionable_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-on-surface-variant text-sm bg-white/50 p-2 rounded-lg border border-primary/10">
                            <ChevronRight size={16} className="text-primary shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {diagnosticResult.recommendation && (
                    <div className="bg-white/50 rounded-xl p-4 border border-surface-container/50 mt-4">
                      <div className="flex gap-2 items-center text-primary font-bold text-sm mb-2">
                        <Info size={16} />
                        <span>General Recommendation</span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">
                        {diagnosticResult.recommendation}
                      </p>
                    </div>
                  )}
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


        </div>
      </div>
    </div>
  );
}
