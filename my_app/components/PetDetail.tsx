"use client";
import React from "react";
import { Button } from "./ui/button";
import { Heart, Stethoscope, MapPin, Syringe, ArrowLeft, Share2 } from "lucide-react";
import { Pet } from "@/lib/data";

interface PetDetailProps {
  pet: Pet;
  onBack?: () => void;
  standalone?: boolean;
}

export default function PetDetail({ pet, onBack, standalone = false }: PetDetailProps) {
  const isTreatment = pet.type === "treatment";
  const isBreeding = pet.type === "breeding";
  const isAdoption = pet.type === "adoption";

  const handleShare = () => {
    // Generate the direct link to the pet profile
    const petUrl = `${window.location.origin}/pet/${pet.id}`;
    const name = pet.name || pet.petName;
    const text = `Check out ${name} on PawSense!\n\n${petUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`animate-fade-in max-w-5xl mx-auto pb-12 ${standalone ? 'pt-16 px-6' : 'pt-8 px-4'}`}>
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>
      )}

      {standalone && !onBack && (
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/?tab=community'}
            className="text-on-surface-variant hover:text-primary pl-0"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to PawSense Community
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Side: Images */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square md:aspect-[4/5] bg-surface-container-low rounded-[32px] overflow-hidden relative border border-surface-container/50 shadow-level-2">
            <img 
              src={pet.image} 
              alt={pet.name || pet.petName} 
              className="w-full h-full object-cover" 
            />
            {isAdoption && (
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-primary flex items-center gap-2 shadow-level-1">
                <Heart size={16} /> Adopt Me
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 flex flex-col py-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-3">
                {pet.name || pet.petName}
              </h1>
              {!isTreatment && (
                <p className="text-xl text-on-surface-variant font-medium">
                  {pet.breed} • {pet.age}
                </p>
              )}
              {isTreatment && (
                <p className="text-xl text-on-surface-variant font-medium flex items-center gap-2">
                  <MapPin size={20} /> {pet.location}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-sm w-12 h-12 shrink-0 border-surface-container hover:bg-surface-container hover:text-primary transition-all"
              onClick={handleShare}
              title="Share Profile"
            >
              <Share2 size={20} />
            </Button>
          </div>

          {/* Info Cards */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] mb-8 border border-surface-container/50 shadow-sm space-y-4">
            {isAdoption && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Syringe size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface-variant">Health Status</h4>
                  <p className="text-on-surface font-medium">{pet.health}</p>
                </div>
              </div>
            )}
            
            {isBreeding && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface-variant">Gender</h4>
                    <p className="text-on-surface font-medium">{pet.gender}</p>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-surface-container/50 my-2"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                    <Syringe size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface-variant">Pedigree</h4>
                    <p className="text-on-surface font-medium">{pet.pedigree}</p>
                  </div>
                </div>
              </>
            )}

            {isTreatment && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface-variant">NGO</h4>
                    <p className="text-on-surface font-medium">{pet.ngo}</p>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-surface-container/50 my-2"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface-variant">Urgency</h4>
                    <p className={`font-medium ${pet.urgency === 'High' ? 'text-error' : 'text-on-surface'}`}>{pet.urgency}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mb-10 flex-1">
            <h3 className="text-2xl font-bold text-on-surface mb-4">
              {isTreatment ? 'Medical Issue' : 'About Me'}
            </h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              {pet.bio || pet.issue}
            </p>

            {isTreatment && pet.raised !== undefined && pet.goal !== undefined && (
              <div className="mt-8 bg-surface-container-low p-6 rounded-2xl border border-surface-container">
                <div className="flex justify-between text-sm font-bold mb-3">
                  <span className="text-on-surface">Raised: ${pet.raised}</span>
                  <span className="text-on-surface-variant">Goal: ${pet.goal}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3 mb-2">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((pet.raised / pet.goal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-surface-container/50">
            {isAdoption && (
              <Button className="flex-1 rounded-full h-14 text-lg font-bold shadow-level-1 hover:shadow-level-2 transition-all">
                Apply for Adoption
              </Button>
            )}
            {isTreatment && (
              <Button variant="secondary" className="flex-1 rounded-full h-14 text-lg font-bold shadow-level-1 hover:shadow-level-2 transition-all">
                Donate for Treatment
              </Button>
            )}
            {isBreeding && (
              <Button variant="outline" className="flex-1 rounded-full h-14 text-lg font-bold border-2 border-tertiary text-tertiary hover:bg-tertiary/10 transition-all">
                Send Breeding Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
