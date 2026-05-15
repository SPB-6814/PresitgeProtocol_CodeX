"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Camera, Loader2, Sparkles, PawPrint, Scale, Calendar, Syringe, Soup, Info, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/lib/supabase";

interface Pet {
  id: string;
  name: string;
  photo_url: string;
  animal_type: string;
  breed: string;
  gender: string;
  age: string;
  weight: number;
  location: string;
  vaccination_status: string;
  diet: string[];
  diet_status: string;
  health_plan: string;
  grooming_plan: string;
  monthly_schedule?: any;
}

export default function MyPetsManager() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [animalType, setAnimalType] = useState("dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [location, setLocation] = useState("");
  const [vaccinationStatus, setVaccinationStatus] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [dietStatus, setDietStatus] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dietOptions = ["milk", "roti", "cereal", "pedigree", "kibble", "wet food", "rice", "chicken"];

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (isEditing && selectedPet) {
      setName(selectedPet.name);
      setAnimalType(selectedPet.animal_type);
      setBreed(selectedPet.breed || "");
      setGender(selectedPet.gender || "Male");
      setAge(selectedPet.age || "");
      setWeight(selectedPet.weight.toString());
      setLocation(selectedPet.location || "");
      setVaccinationStatus(selectedPet.vaccination_status || "");
      setDiet(selectedPet.diet || []);
      setDietStatus(selectedPet.diet_status || "");
      setImage(selectedPet.photo_url);
    }
  }, [isEditing, selectedPet]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("my_pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const toggleDiet = (item: string) => {
    setDiet(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleGetAIInsights = async (pet: Pet) => {
    try {
      setGeneratingPlan(true);
      
      const payload = {
        name: pet.name,
        animal_type: pet.animal_type,
        breed: pet.breed || "Unknown",
        age: pet.age || "Unknown",
        weight: pet.weight || 0,
        location: pet.location || "Unknown",
        vaccination_status: pet.vaccination_status || "Unknown",
        diet: Array.isArray(pet.diet) ? pet.diet : (typeof pet.diet === 'string' ? (pet.diet as any).split(',') : []),
        diet_status: pet.diet_status || "None"
      };

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pet_profile', payload })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend returned:", response.status, errText);
        throw new Error(`Failed to generate insights: ${errText}`);
      }
      
      const data = await response.json();

      // Update Supabase
      const { error } = await supabase
        .from('my_pets')
        .update({
          health_plan: data.health_plan,
          grooming_plan: data.grooming_plan,
          monthly_schedule: data.monthly_schedule
        })
        .eq('id', pet.id);

      if (error) throw error;

      // Update local state
      const updatedPet = { 
        ...pet, 
        health_plan: data.health_plan, 
        grooming_plan: data.grooming_plan,
        monthly_schedule: data.monthly_schedule 
      };
      
      setPets(prev => prev.map(p => p.id === pet.id ? updatedPet : p));
      if (selectedPet && selectedPet.id === pet.id) {
        setSelectedPet(updatedPet);
      }

    } catch (error) {
      console.error("Error generating insights:", error);
      alert("Failed to generate AI Care Plan. Please try again.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let finalImageData = image || "";
      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(imageFile);
        });
        finalImageData = await base64Promise;
      }

      const petData = {
        name,
        animal_type: animalType,
        breed,
        gender,
        age,
        weight: parseFloat(weight),
        location,
        vaccination_status: vaccinationStatus,
        diet,
        diet_status: dietStatus
      };

      // Just save to Supabase, don't call Gemini yet
      const { error } = await supabase
        .from("my_pets")
        .insert([{
          ...petData,
          user_id: user.id,
          photo_url: finalImageData,
          health_plan: null,
          grooming_plan: null
        }]);

      if (error) throw error;

      // Reset Form
      setName("");
      setBreed("");
      setAge("");
      setWeight("");
      setLocation("");
      setVaccinationStatus("");
      setDiet([]);
      setDietStatus("");
      setImage(null);
      setImageFile(null);
      setShowAddForm(false);
      fetchPets();
    } catch (error: any) {
      console.error("Error adding pet:", error);
      alert("Failed to add pet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    try {
      setLoading(true);
      
      let finalImageData = image || "";
      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(imageFile);
        });
        finalImageData = await base64Promise;
      }

      const updatedData = {
        name,
        animal_type: animalType,
        breed,
        gender,
        age,
        weight: parseFloat(weight),
        location,
        vaccination_status: vaccinationStatus,
        diet,
        diet_status: dietStatus,
        photo_url: finalImageData
      };

      const { error } = await supabase
        .from("my_pets")
        .update(updatedData)
        .eq("id", selectedPet.id);

      if (error) throw error;

      setIsEditing(false);
      setSelectedPet({ ...selectedPet, ...updatedData });
      fetchPets();
    } catch (error: any) {
      console.error("Error updating pet:", error);
      alert("Failed to update pet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm("Are you sure you want to delete this pet? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("my_pets")
        .delete()
        .eq("id", petId);

      if (error) throw error;
      
      setPets(prev => prev.filter(p => p.id !== petId));
      setSelectedPet(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error deleting pet:", error);
      alert("Failed to delete pet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pets.length) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (selectedPet) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedPet(null); setIsEditing(false); }} className="rounded-full">
              <X size={20} />
            </Button>
            <h3 className="text-xl font-bold text-on-surface">{isEditing ? `Edit ${selectedPet.name}` : selectedPet.name}</h3>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-full gap-2">
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePet(selectedPet.id);
                }} 
                className="rounded-full border-error/50 text-error hover:bg-error/10 hover:border-error"
                title="Delete Pet"
              >
                <Trash size={16} />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className="aspect-square rounded-2xl border-2 border-dashed border-surface-container flex flex-col items-center justify-center bg-surface-container-low cursor-pointer relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? <img src={image} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={32} />}
                  <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 mb-1 block">Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 mb-1 block">Breed</label>
                    <input value={breed} onChange={e => setBreed(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 mb-1 block">Age</label>
                      <input value={age} onChange={e => setAge(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 mb-1 block">Weight</label>
                      <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-surface-container-low p-3 rounded-xl outline-none text-sm" />
                    </div>
                  </div>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full bg-surface-container-low p-3 rounded-xl outline-none text-sm" />
                  <input value={vaccinationStatus} onChange={e => setVaccinationStatus(e.target.value)} placeholder="Vaccination" className="w-full bg-surface-container-low p-3 rounded-xl outline-none text-sm" />
                </div>
             </div>
             <div>
                <label className="text-xs font-bold mb-2 block">Diet Habits</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dietOptions.map(opt => (
                    <button key={opt} type="button" onClick={() => toggleDiet(opt)} className={`px-3 py-1 rounded-full text-xs border font-bold transition-all ${diet.includes(opt) ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-low border-surface-container"}`}>{opt}</button>
                  ))}
                </div>
                <textarea value={dietStatus} onChange={e => setDietStatus(e.target.value)} placeholder="Diet notes..." className="w-full bg-surface-container-low p-3 rounded-xl outline-none min-h-[80px] text-sm resize-none" />
             </div>
             <div className="flex gap-2">
                <Button type="submit" className="flex-1 rounded-xl py-6 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl">Cancel</Button>
             </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-level-2">
                <img src={selectedPet.photo_url || "/pet1.png"} alt={selectedPet.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container/50">
                  <div className="flex items-center gap-2 text-primary mb-1"><Syringe size={14} /><span className="text-[10px] font-bold uppercase">Vaccination</span></div>
                  <p className="text-sm font-bold text-on-surface">{selectedPet.vaccination_status || "Not recorded"}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container/50">
                  <div className="flex items-center gap-2 text-secondary mb-1"><Soup size={14} /><span className="text-[10px] font-bold uppercase">Diet</span></div>
                  <p className="text-sm font-bold text-on-surface truncate">{selectedPet.diet?.join(", ") || "Standard"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-primary flex items-center gap-2">
                    <Sparkles size={18} /> AI Care Plan
                  </h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => handleGetAIInsights(selectedPet)}
                    disabled={generatingPlan}
                  >
                    {generatingPlan ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Refresh
                  </Button>
                </div>
                <div className="text-sm text-on-surface-variant prose prose-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                  {selectedPet.health_plan ? (
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-bold text-on-surface mb-2 border-b border-primary/10 pb-1">General Health Plan</h5>
                        <div dangerouslySetInnerHTML={{ __html: selectedPet.health_plan.replace(/\n/g, '<br/>') }} />
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface mb-2 border-b border-primary/10 pb-1">Grooming Plan</h5>
                        <div dangerouslySetInnerHTML={{ __html: selectedPet.grooming_plan?.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="mx-auto mb-2 text-primary/30" size={24} />
                      <p className="text-xs mb-4">No insights yet. Ready to analyze your pet's data?</p>
                      <Button size="sm" className="rounded-full" onClick={() => handleGetAIInsights(selectedPet)} disabled={generatingPlan}>Get Insights</Button>
                    </div>
                  )}
                </div>
              </div>

              <Card className="p-6 border-surface-container bg-surface-container-lowest shadow-none">
                 <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-on-surface"><Info size={16} className="text-primary" /> Profile Details</h4>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-surface-container pb-2">
                       <span className="text-on-surface-variant font-medium">Weight</span>
                       <span className="font-bold text-on-surface">{selectedPet.weight} kg</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-container pb-2">
                       <span className="text-on-surface-variant font-medium">Location</span>
                       <span className="font-bold text-on-surface">{selectedPet.location || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-on-surface-variant font-medium">Dietary Notes</span>
                       <p className="text-xs italic bg-surface-container-low p-3 rounded-xl border border-surface-container/30 text-on-surface-variant">{selectedPet.diet_status || "No specific notes provided."}</p>
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Add New Pet</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)} className="rounded-full">
              <X size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div 
              className="aspect-square rounded-2xl border-2 border-dashed border-surface-container flex flex-col items-center justify-center bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="text-on-surface-variant mb-2" size={32} />
                  <p className="text-xs text-on-surface-variant font-medium text-center px-4">Upload Pet Photo</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Type</label>
                  <select 
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value)}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Breed</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Beagle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Age</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 2 years"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Location</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Vaccination Status</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={vaccinationStatus}
                  onChange={(e) => setVaccinationStatus(e.target.value)}
                  placeholder="e.g. Up to date"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Diet (Select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {dietOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleDiet(option)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      diet.includes(option)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-container-low border-surface-container text-on-surface-variant hover:border-primary/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant ml-1 mb-1 block uppercase">Diet Status / Notes</label>
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px] resize-none"
                value={dietStatus}
                onChange={(e) => setDietStatus(e.target.value)}
                placeholder="Any allergies or specific eating habits?"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-2xl py-6 font-bold shadow-level-2 gap-2"
          >
            <PawPrint size={20} />
            Add Pet Profile
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Your Pets</h3>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="rounded-full w-10 h-10 p-0"
              title="Add New Pet"
            >
              <Plus size={24} />
            </Button>
          </div>

          {pets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className="p-4 border-surface-container shadow-level-1 hover:shadow-level-2 transition-all cursor-pointer group"
                  onClick={() => setSelectedPet(pet)}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-low overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img src={pet.photo_url || "/pet1.png"} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-on-surface">{pet.name}</h4>
                          <p className="text-xs text-on-surface-variant">{pet.breed} • {pet.age}</p>
                        </div>
                        <div className="p-1.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={16} />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                         <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                           <Scale size={10} /> {pet.weight}kg
                         </span>
                         {pet.health_plan ? (
                           <span className="px-2 py-0.5 rounded-full bg-primary/5 text-[10px] font-bold text-primary flex items-center gap-1">
                             <Sparkles size={10} /> View AI Plan
                           </span>
                         ) : (
                           <Button 
                             size="sm" 
                             variant="ghost"
                             className="h-5 px-2 py-0 rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary/20"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleGetAIInsights(pet);
                             }}
                             disabled={generatingPlan}
                           >
                             {generatingPlan ? <Loader2 size={10} className="animate-spin mr-1" /> : <Sparkles size={10} className="mr-1" />}
                             Get AI Insights
                           </Button>
                         )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-surface-container-low rounded-3xl border border-dashed border-surface-container">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                <PawPrint size={32} className="text-on-surface-variant/30" />
              </div>
              <p className="text-on-surface-variant font-medium">No pets added yet.</p>
              <p className="text-xs text-on-surface-variant mt-1 mb-6">Add your pet to get personalized health and grooming plans.</p>
              <Button variant="outline" onClick={() => setShowAddForm(true)} className="rounded-full">
                Add Your First Pet
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
