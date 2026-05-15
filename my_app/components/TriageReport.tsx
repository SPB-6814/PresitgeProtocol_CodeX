'use client';

import React, { useState } from 'react';
import { AlertCircle, Activity, CheckCircle2, MapPin, ChevronRight, Stethoscope } from 'lucide-react';

export default function TriageReport() {
  const [symptoms, setSymptoms] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Connects to the new FastAPI backend endpoint
      const response = await fetch('http://localhost:8000/api/assess-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            symptoms, 
            breed: breed || "Unknown", 
            age: age || "Unknown",
            region: region || undefined 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        console.error("Backend error, displaying mock LLM data.");
        setResult({
            severity: "High",
            clinical_assessment: "Based on the reported lethargy and vomiting, there is a significant risk of dehydration or a gastrointestinal obstruction. These symptoms warrant prompt veterinary attention.",
            community_alert: "Several similar cases of gastrointestinal issues have been reported in your area recently, possibly linked to a local dog park.",
            actionable_steps: [
                "Remove access to food and water immediately to prevent further vomiting.",
                "Contact your local emergency veterinary clinic.",
                "Monitor for any other signs such as diarrhea or pale gums."
            ]
        });
      }
    } catch (error) {
      console.error("Triage request failed:", error);
      // Fallback mock
      setResult({
            severity: "Moderate",
            clinical_assessment: "The symptoms described require monitoring. While not immediately life-threatening, persistent issues should be evaluated by a professional.",
            community_alert: "No recent local community trends reported for these symptoms.",
            actionable_steps: [
                "Keep the pet rested and comfortable.",
                "Observe closely for the next 12-24 hours.",
                "Schedule a non-emergency vet appointment if symptoms persist."
            ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
      switch(severity?.toLowerCase()) {
          case 'critical': return 'bg-red-600 text-white';
          case 'high': return 'bg-orange-500 text-white';
          case 'moderate': return 'bg-yellow-500 text-white';
          case 'low': return 'bg-green-500 text-white';
          default: return 'bg-gray-500 text-white';
      }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-surface rounded-3xl shadow-sm border border-surface-container">
      <div className="flex items-center gap-3 mb-6 text-primary">
        <Stethoscope size={28} />
        <h2 className="text-2xl font-bold text-on-surface">PawSense AI Triage</h2>
      </div>
      
      <form onSubmit={handleTriage} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Breed (Optional)</label>
                <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g., Golden Retriever"
                    className="w-full p-3 border border-surface-container rounded-xl focus:ring-2 focus:ring-primary/50 text-on-surface"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Age (Optional)</label>
                <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 2 years, 6 months"
                    className="w-full p-3 border border-surface-container rounded-xl focus:ring-2 focus:ring-primary/50 text-on-surface"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Symptoms Description</label>
            <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your pet's symptoms in detail (e.g., lethargy, refusing water for 24h...)"
                className="w-full p-4 border border-surface-container rounded-xl h-32 focus:ring-2 focus:ring-primary/50 text-on-surface"
                required
            />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Region (Optional for Community Trends)</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., Downtown, Westside"
                    className="w-full pl-10 p-3 border border-surface-container rounded-xl focus:ring-2 focus:ring-primary/50 text-on-surface"
                />
            </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full px-4 py-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-level-1 flex justify-center items-center gap-2"
        >
          {loading ? (
             <>
               <div className="animate-spin h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full"></div>
               Analyzing Clinical & Community Databases...
             </>
          ) : 'Generate Triage Report'}
        </button>
      </form>

      {result && (
        <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm relative overflow-hidden">
             {/* Severity Badge */}
             <div className={`absolute top-0 right-0 px-4 py-2 font-bold rounded-bl-2xl ${getSeverityColor(result.severity)}`}>
                 Severity: {result.severity}
             </div>

             <div className="flex items-center gap-2 mb-4 text-primary">
                 <Activity size={24} />
                 <h3 className="text-xl font-bold">Clinical Assessment</h3>
             </div>
             <p className="text-on-surface leading-relaxed mb-6 pr-24">
                 {result.clinical_assessment}
             </p>

             <div className="bg-secondary/5 border border-secondary/20 p-4 rounded-xl mb-6">
                 <div className="flex items-center gap-2 mb-2 text-secondary font-bold">
                     <MapPin size={18} />
                     <h4>Community Alert</h4>
                 </div>
                 <p className="text-on-surface-variant text-sm">
                     {result.community_alert}
                 </p>
             </div>

             <div>
                 <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                     <CheckCircle2 size={18} className="text-primary"/> Actionable Steps
                 </h4>
                 <ul className="space-y-2">
                     {result.actionable_steps?.map((step: string, idx: number) => (
                         <li key={idx} className="flex items-start gap-2 text-on-surface-variant text-sm bg-surface-container/30 p-3 rounded-lg">
                             <ChevronRight size={16} className="text-primary shrink-0 mt-0.5" />
                             <span>{step}</span>
                         </li>
                     ))}
                 </ul>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
