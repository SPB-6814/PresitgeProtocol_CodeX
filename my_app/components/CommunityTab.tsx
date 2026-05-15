"use client";
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Stethoscope, MapPin, Syringe, Search, Filter, Share2 } from "lucide-react";
import { PETS_DATA, Pet } from "@/lib/data";
import PetDetail from "./PetDetail";
import { supabase } from "@/lib/supabase";
import CreateCommunityPostModal from "./CreateCommunityPostModal";
import AuthModal from "./AuthModal";
import { Loader2 } from "lucide-react";

export default function CommunityTab() {
  const [activeTab, setActiveTab] = useState<"adoption" | "treatment" | "breeding" | "stray_report">("adoption");
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("All");
  const [breedSearchQuery, setBreedSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("Any");
  
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [livePets, setLivePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handlePostClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPets: Pet[] = (data || []).map(p => ({
        id: p.id,
        ownerId: p.user_id,
        type: p.type as any,
        name: p.name || (p.type === 'stray_report' ? 'Unknown ' + p.breed : 'Pet'),
        petName: p.name,
        breed: p.breed,
        age: p.age,
        gender: p.gender,
        health: p.health_status,
        image: p.image_url,
        bio: p.bio,
        issue: p.issue || p.bio,
        pedigree: p.pedigree,
        location: p.location_tag,
        urgency: p.urgency || "Normal",
        raised: Number(p.raised_amount || 0),
        goal: Number(p.goal_amount || 0),
      }));

      setLivePets(mappedPets);
    } catch (error) {
      console.error("Error fetching community posts:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCommunityPosts();
  }, []);

  const ALL_PETS = [...livePets, ...PETS_DATA];

  const ADOPTION_PETS = ALL_PETS.filter(p => p.type === "adoption");
  const TREATMENT_POSTS = ALL_PETS.filter(p => p.type === "treatment");
  const BREEDING_PETS = ALL_PETS.filter(p => p.type === "breeding");
  const STRAY_POSTS = ALL_PETS.filter(p => p.type === "stray_report");

  const filteredBreedingPets = BREEDING_PETS.filter(pet => {
    const matchesSearch = pet.breed?.toLowerCase().includes(breedSearchQuery.toLowerCase());
    const matchesGender = genderFilter === "Any" || pet.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const filteredAdoptionPets = ADOPTION_PETS.filter(pet => {
    const nameMatch = pet.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const breedMatch = pet.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || breedMatch;
    
    let matchesAge = true;
    if (ageFilter === "Puppy/Kitten" && pet.age) {
      matchesAge = pet.age.includes("months") || pet.age.includes("weeks");
    } else if (ageFilter === "Adult" && pet.age) {
      matchesAge = pet.age.includes("year");
    }
    return matchesSearch && matchesAge;
  });

  const handleShare = (e: React.MouseEvent, pet: Pet) => {
    e.stopPropagation();
    const petUrl = `${window.location.origin}/pet/${pet.id}`;
    const name = pet.name || pet.petName;
    const text = `Check out ${name} on PawSense!\n\n${petUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (selectedPet) {
    return <PetDetail pet={selectedPet} onBack={() => setSelectedPet(null)} />;
  }

  return (
    <div className="pt-8 px-4 animate-fade-in">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-on-surface">Community Center</h2>
        <Button 
          className="rounded-full bg-primary text-on-primary shadow-level-2 hover:shadow-level-3 transition-all flex items-center gap-2"
          onClick={handlePostClick}
        >
          <Share2 size={18} />
          Post to Community
        </Button>
      </div>

      {loading && livePets.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {/* Inner Tabs */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={() => setActiveTab("adoption")}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "adoption"
              ? "bg-primary text-on-primary shadow-level-1"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Adoption
        </button>
        <button
          onClick={() => setActiveTab("treatment")}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "treatment"
              ? "bg-secondary text-on-secondary shadow-level-1"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Treatment (NGOs)
        </button>
        <button
          onClick={() => setActiveTab("breeding")}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "breeding"
              ? "bg-tertiary text-on-tertiary shadow-level-1"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Breeding
        </button>
        <button
          onClick={() => setActiveTab("stray_report")}
          className={`px-6 py-2 rounded-full font-bold transition-all ${
            activeTab === "stray_report"
              ? "bg-error text-on-error shadow-level-1"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Stray Sightings
        </button>
      </div>

      {/* Content */}
      {activeTab === "adoption" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or breed..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={18} className="text-on-surface-variant" />
              <select 
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="flex-1 sm:w-auto py-2 px-4 rounded-full border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-primary text-sm cursor-pointer"
              >
                <option value="All">All Ages</option>
                <option value="Puppy/Kitten">Puppy / Kitten</option>
                <option value="Adult">Adult</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdoptionPets.map((pet) => (
            <Card 
              key={pet.id} 
              className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow cursor-pointer"
              onClick={() => setSelectedPet(pet)}
            >
              <div className="aspect-[4/3] bg-surface-container-low relative">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                  <Heart size={14} /> Adopt Me
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-on-surface">{pet.name}</h3>
                      {pet.gender && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          pet.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {pet.gender}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">{pet.breed} • {pet.age}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full"
                    onClick={(e) => handleShare(e, pet)}
                    title="Share"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl mb-4 border border-surface-container/50">
                  <p className="text-xs font-medium text-on-surface flex items-center gap-2 mb-1">
                    <Syringe size={14} className="text-primary" /> {pet.health}
                  </p>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1 line-clamp-2">
                  {pet.bio}
                </p>
                <Button 
                  className="w-full mt-auto rounded-full font-bold shadow-level-1 transition-all"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    setSelectedPet(pet);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
            ))}
          </div>
          {filteredAdoptionPets.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              No pets found matching your criteria.
            </div>
          )}
        </>
      )}

      {activeTab === "treatment" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {TREATMENT_POSTS.map((post) => (
            <Card 
              key={post.id} 
              className="overflow-hidden flex flex-col md:flex-row hover:shadow-level-2 transition-shadow border-surface-container cursor-pointer"
              onClick={() => setSelectedPet(post)}
            >
              <div className="md:w-1/3 aspect-video md:aspect-auto bg-surface-container-low relative">
                 <img src={post.image} alt={post.petName} className="w-full h-full object-cover" />
                 <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                   post.urgency === "High" ? "bg-error text-on-error" : "bg-tertiary text-on-tertiary"
                 }`}>
                   {post.urgency} Urgency
                 </div>
              </div>
              <div className="p-6 md:w-2/3 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-on-surface">Help {post.petName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">
                      {post.ngo}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-full"
                      onClick={(e) => handleShare(e, post)}
                      title="Share"
                    >
                      <Share2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant flex items-center gap-1 mb-4">
                  <MapPin size={14} /> {post.location}
                </p>
                <div className="bg-surface-container-lowest p-3 rounded-xl mb-4 border border-surface-container/50 flex gap-3 items-start">
                  <Stethoscope size={20} className="text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-on-surface line-clamp-2">{post.issue}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-on-surface-variant">Raised: ${post.raised}</span>
                    <span className="text-on-surface-variant">Goal: ${post.goal}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min(((post.raised ?? 0) / (post.goal ?? 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="w-full rounded-full font-bold shadow-level-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPet(post);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "breeding" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Search by breed..." 
                value={breedSearchQuery}
                onChange={(e) => setBreedSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-tertiary text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={18} className="text-on-surface-variant" />
              <select 
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="flex-1 sm:w-auto py-2 px-4 rounded-full border border-surface-container bg-surface-container-lowest focus:outline-none focus:border-tertiary text-sm cursor-pointer"
              >
                <option value="Any">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBreedingPets.map((pet) => (
            <Card 
              key={pet.id} 
              className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow border-t-4 border-t-tertiary cursor-pointer"
              onClick={() => setSelectedPet(pet)}
            >
              <div className="aspect-[4/3] bg-surface-container-low relative">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-tertiary flex items-center gap-1">
                  <Heart size={14} /> Breeding Match
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{pet.name}</h3>
                    <p className="text-sm text-on-surface-variant">{pet.breed} • {pet.age}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pet.gender && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        pet.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {pet.gender}
                      </span>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-full"
                      onClick={(e) => handleShare(e, pet)}
                      title="Share"
                    >
                      <Share2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl mb-4 border border-surface-container/50">
                  <p className="text-xs font-medium text-on-surface flex items-center gap-2 mb-1">
                    <Syringe size={14} className="text-tertiary" /> {pet.pedigree}
                  </p>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1 line-clamp-2">
                  {pet.bio}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-auto rounded-full font-bold hover:bg-tertiary/10 hover:text-tertiary transition-all border-tertiary text-tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPet(pet);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
            ))}
          </div>
          {filteredBreedingPets.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              No pets found matching your criteria.
            </div>
          )}
        </>
      )}

      {activeTab === "stray_report" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STRAY_POSTS.map((pet) => (
            <Card 
              key={pet.id} 
              className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow cursor-pointer"
              onClick={() => setSelectedPet(pet)}
            >
              <div className="aspect-[4/3] bg-surface-container-low relative">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-error text-on-error px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <MapPin size={14} /> Sighting
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{pet.name}</h3>
                    <p className="text-sm text-on-surface-variant">{pet.breed} • {pet.location}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full"
                    onClick={(e) => handleShare(e, pet)}
                    title="Share"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                  "{pet.bio}"
                </p>
                <Button 
                  variant="outline"
                  className="w-full mt-auto rounded-full font-bold border-error text-error hover:bg-error/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPet(pet);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
            ))}
          </div>
          {STRAY_POSTS.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              No sightings reported yet.
            </div>
          )}
        </>
      )}

      <CreateCommunityPostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCommunityPosts}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
}
