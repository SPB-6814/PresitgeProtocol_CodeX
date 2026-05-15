"use client";
import React from "react";
import { Button } from "./ui/button";
import { Heart, Stethoscope, MapPin, Syringe, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { Pet } from "@/lib/data";
import { supabase } from "@/lib/supabase";

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
    const petUrl = `${window.location.origin}/pet/${pet.id}`;
    const name = pet.name || pet.petName;
    const text = `Check out ${name} on PawSense!\n\n${petUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const [requestModalOpen, setRequestModalOpen] = React.useState(false);
  const [requestMessage, setRequestMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const handleRequest = async () => {
    if (!currentUser) {
      alert("Please log in to send a request.");
      return;
    }

    if (currentUser.id === pet.ownerId) {
      alert("You cannot send a request for your own post.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('pet_requests')
        .insert([{
          post_id: pet.id,
          requester_id: currentUser.id,
          owner_id: pet.ownerId,
          type: pet.type,
          message: requestMessage,
          status: 'pending'
        }]);

      if (error) throw error;

      alert("Request sent successfully!");
      setRequestModalOpen(false);
      setRequestMessage("");
    } catch (error: any) {
      console.error("Error sending request:", error);
      alert("Failed to send request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = currentUser?.id === pet.ownerId;

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
        <div className="w-full md:w-1/2">
          <div className="aspect-square md:aspect-[4/5] bg-surface-container-low rounded-[32px] overflow-hidden relative border border-surface-container/50 shadow-level-2">
            <img src={pet.image} alt={pet.name || pet.petName} className="w-full h-full object-cover" />
            {isAdoption && (
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-primary flex items-center gap-2 shadow-level-1">
                <Heart size={16} /> Adopt Me
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col py-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-3">{pet.name || pet.petName}</h1>
              {!isTreatment && <p className="text-xl text-on-surface-variant font-medium">{pet.breed} • {pet.age}</p>}
              {isTreatment && <p className="text-xl text-on-surface-variant font-medium flex items-center gap-2"><MapPin size={20} /> {pet.location}</p>}
            </div>
            <Button variant="outline" size="icon" className="rounded-full shadow-sm w-12 h-12 shrink-0 border-surface-container hover:bg-surface-container hover:text-primary transition-all" onClick={handleShare} title="Share Profile">
              <Share2 size={20} />
            </Button>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-[24px] mb-8 border border-surface-container/50 shadow-sm space-y-4">
            {isAdoption && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Syringe size={24} /></div>
                <div><h4 className="text-sm font-bold text-on-surface-variant">Health Status</h4><p className="text-on-surface font-medium">{pet.health}</p></div>
              </div>
            )}
            {isBreeding && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0"><Heart size={24} /></div>
                  <div><h4 className="text-sm font-bold text-on-surface-variant">Gender</h4><p className="text-on-surface font-medium">{pet.gender}</p></div>
                </div>
                <div className="w-full h-[1px] bg-surface-container/50 my-2"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0"><Syringe size={24} /></div>
                  <div><h4 className="text-sm font-bold text-on-surface-variant">Pedigree</h4><p className="text-on-surface font-medium">{pet.pedigree}</p></div>
                </div>
              </>
            )}
            {isTreatment && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0"><Heart size={24} /></div>
                  <div><h4 className="text-sm font-bold text-on-surface-variant">NGO</h4><p className="text-on-surface font-medium">{pet.ngo}</p></div>
                </div>
                <div className="w-full h-[1px] bg-surface-container/50 my-2"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0"><Stethoscope size={24} /></div>
                  <div><h4 className="text-sm font-bold text-on-surface-variant">Urgency</h4><p className={`font-medium ${pet.urgency === 'High' ? 'text-error' : 'text-on-surface'}`}>{pet.urgency}</p></div>
                </div>
              </>
            )}
          </div>

          <div className="mb-10 flex-1">
            <h3 className="text-2xl font-bold text-on-surface mb-4">{isTreatment ? 'Medical Issue' : 'About Me'}</h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">{pet.bio || pet.issue}</p>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-surface-container/50">
            {isAdoption && (
              <Button 
                className="flex-1 rounded-full h-14 text-lg font-bold shadow-level-1 hover:shadow-level-2 transition-all"
                disabled={isOwner || !pet.ownerId}
                onClick={() => setRequestModalOpen(true)}
              >
                {isOwner ? "Your Post" : "Apply for Adoption"}
              </Button>
            )}
            {isBreeding && (
              <Button 
                variant="outline" 
                className="flex-1 rounded-full h-14 text-lg font-bold border-2 border-tertiary text-tertiary hover:bg-tertiary/10 transition-all"
                disabled={isOwner || !pet.ownerId}
                onClick={() => setRequestModalOpen(true)}
              >
                {isOwner ? "Your Post" : "Send Breeding Request"}
              </Button>
            )}
            {isTreatment && (
              <Button variant="secondary" className="flex-1 rounded-full h-14 text-lg font-bold shadow-level-1 hover:shadow-level-2 transition-all">
                Donate for Treatment
              </Button>
            )}
          </div>
        </div>
      </div>

      {requestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-[32px] p-8 shadow-level-4 border border-surface-container animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-on-surface mb-2">Send Request</h3>
            <p className="text-on-surface-variant text-sm mb-6">Tell the owner why you're interested in {pet.name || pet.petName}.</p>
            
            <textarea
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] resize-none mb-6"
              placeholder="Hi, I'm interested in..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />
            
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                className="flex-1 rounded-full"
                onClick={() => setRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-full font-bold"
                onClick={handleRequest}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
