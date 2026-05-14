"use client";
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Stethoscope, MapPin, Syringe, Search, Filter } from "lucide-react";

const ADOPTION_PETS = [
  {
    id: 1,
    name: "Bella",
    type: "Dog",
    breed: "Labrador Retriever Mix",
    age: "2 years",
    health: "Vaccinated, Spayed",
    image: "/pet1.png",
    bio: "Bella is a sweet and energetic girl who loves to play fetch and go on long walks. She's great with kids and other dogs."
  },
  {
    id: 2,
    name: "Oliver",
    type: "Cat",
    breed: "Domestic Shorthair",
    age: "1 year",
    health: "Vaccinated, Neutered",
    image: "/pet2.png",
    bio: "Oliver is a cuddle bug who enjoys lounging in sunny spots and chasing laser pointers. Perfect companion for a quiet home."
  },
  {
    id: 3,
    name: "Luna",
    type: "Dog",
    breed: "German Shepherd",
    age: "3 months",
    health: "1st Shots, Dewormed",
    image: "/pet1.png", // reusing for demo
    bio: "Luna is a smart pup ready for training. She is very curious and needs an active family to keep her engaged."
  }
];

const TREATMENT_POSTS = [
  {
    id: 1,
    ngo: "Paws Rescue Center",
    location: "Downtown Clinic (2 miles away)",
    petName: "Max",
    issue: "Needs emergency orthopedic surgery for a broken leg.",
    urgency: "High",
    raised: 450,
    goal: 1200,
    image: "/pet2.png" // reusing for demo
  },
  {
    id: 2,
    ngo: "Hope Animal Shelter",
    location: "Westside Branch (5 miles away)",
    petName: "Daisy",
    issue: "Requires ongoing treatment for severe skin infection and malnutrition.",
    urgency: "Medium",
    raised: 120,
    goal: 500,
    image: "/pet1.png"
  }
];

export default function CommunityTab() {
  const [activeTab, setActiveTab] = useState<"adoption" | "treatment">("adoption");
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("All");

  const filteredAdoptionPets = ADOPTION_PETS.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesAge = true;
    if (ageFilter === "Puppy/Kitten") {
      matchesAge = pet.age.includes("months") || pet.age.includes("weeks");
    } else if (ageFilter === "Adult") {
      matchesAge = pet.age.includes("year");
    }
    return matchesSearch && matchesAge;
  });

  return (
    <div className="pt-8 px-4 animate-fade-in">
      {/* Inner Tabs */}
      <div className="flex gap-4 justify-center mb-8">
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
            <Card key={pet.id} className="overflow-hidden flex flex-col hover:shadow-level-2 transition-shadow">
              <div className="aspect-[4/3] bg-surface-container-low relative">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                  <Heart size={14} /> Adopt Me
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{pet.name}</h3>
                    <p className="text-sm text-on-surface-variant">{pet.breed} • {pet.age}</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl mb-4 border border-surface-container/50">
                  <p className="text-xs font-medium text-on-surface flex items-center gap-2 mb-1">
                    <Syringe size={14} className="text-primary" /> {pet.health}
                  </p>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                  {pet.bio}
                </p>
                <Button className="w-full mt-auto rounded-full font-bold shadow-level-1 hover:shadow-level-2 transition-all">
                  Apply for Adoption
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
            <Card key={post.id} className="overflow-hidden flex flex-col md:flex-row hover:shadow-level-2 transition-shadow border-surface-container">
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
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">
                    {post.ngo}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant flex items-center gap-1 mb-4">
                  <MapPin size={14} /> {post.location}
                </p>
                <div className="bg-surface-container-lowest p-3 rounded-xl mb-4 border border-surface-container/50 flex gap-3 items-start">
                  <Stethoscope size={20} className="text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-on-surface">{post.issue}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-on-surface-variant">Raised: ${post.raised}</span>
                    <span className="text-on-surface-variant">Goal: ${post.goal}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((post.raised / post.goal) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <Button variant="secondary" className="w-full rounded-full font-bold shadow-level-1">
                    Donate for Treatment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
