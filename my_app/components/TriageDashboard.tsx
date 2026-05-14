"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  UploadCloud,
  Camera,
  Activity,
  AlertCircle,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "./ui/badge";

export default function TriageDashboard() {
  return (
    <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2">
            Triage Dashboard
          </h2>
          <p className="text-on-surface-variant text-[16px]">
            AI-driven diagnostics and real-time regional health alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Symptom Assessment Card (8 cols on desktop) */}
        <Card className="md:col-span-8 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="text-primary" />
                Symptom Assessment
              </CardTitle>
              <Badge variant="secondary">Beta AI Model</Badge>
            </div>
            <p className="text-sm text-on-surface-variant mt-2">
              Upload a photo or describe symptoms to get an instant AI
              evaluation of your pet's condition.
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="border-2 border-dashed border-outline-variant rounded-DEFAULT bg-surface-container-low flex flex-col items-center justify-center py-12 gap-4 h-full min-h-[240px]">
              <div className="bg-primary-container/20 p-4 rounded-full text-primary">
                <UploadCloud size={32} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-on-surface">
                  Drag & drop image here
                </p>
                <p className="text-sm text-on-surface-variant">
                  or click to browse from your device
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 border-outline-variant bg-surface-container-lowest"
                >
                  <Camera size={16} />
                  Take Photo
                </Button>
                <Button size="sm">Select File</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Alert Card (4 cols on desktop) */}
        <Card className="md:col-span-4 bg-surface-container-lowest flex flex-col border border-error/20">
          <CardHeader className="bg-error-container/30 rounded-t-DEFAULT">
            <CardTitle className="flex items-center gap-2 text-on-error-container text-xl">
              <AlertCircle className="text-error" />
              Regional Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-4">
            <div className="p-4 bg-error-container rounded-DEFAULT flex gap-3 items-start">
              <AlertTriangle className="text-error shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-on-error-container text-sm">
                  Canine Parvovirus Outbreak
                </h4>
                <p className="text-xs text-on-error-container/80 mt-1 flex items-center gap-1">
                  <MapPin size={12} /> South District (2.4 miles away)
                </p>
                <p className="text-xs text-on-error-container/90 mt-2 font-medium">
                  14 cases reported in last 48h. Avoid public dog parks.
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-container rounded-DEFAULT flex gap-3 items-start">
              <Activity className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-on-surface text-sm">
                  Feline Calicivirus Warning
                </h4>
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <MapPin size={12} /> North Ward (5.1 miles away)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button variant="ghost" className="w-full text-sm">
              View All Local Alerts
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
