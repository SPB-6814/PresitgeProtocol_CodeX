export interface Pet {
  id: string;
  type: "adoption" | "treatment" | "breeding";
  name?: string;
  petName?: string;
  breed?: string;
  age?: string;
  health?: string;
  image: string;
  bio?: string;
  issue?: string;
  gender?: string;
  pedigree?: string;
  ngo?: string;
  location?: string;
  urgency?: string;
  raised?: number;
  goal?: number;
}

export const PETS_DATA: Pet[] = [
  // Adoption
  {
    id: "adopt_1",
    type: "adoption",
    name: "Bella",
    breed: "Labrador Retriever Mix",
    age: "2 years",
    health: "Vaccinated, Spayed",
    image: "/pet1.png",
    bio: "Bella is a sweet and energetic girl who loves to play fetch and go on long walks. She's great with kids and other dogs."
  },
  {
    id: "adopt_2",
    type: "adoption",
    name: "Oliver",
    breed: "Domestic Shorthair",
    age: "1 year",
    health: "Vaccinated, Neutered",
    image: "/pet2.png",
    bio: "Oliver is a cuddle bug who enjoys lounging in sunny spots and chasing laser pointers. Perfect companion for a quiet home."
  },
  {
    id: "adopt_3",
    type: "adoption",
    name: "Luna",
    breed: "German Shepherd",
    age: "3 months",
    health: "1st Shots, Dewormed",
    image: "/pet1.png",
    bio: "Luna is a smart pup ready for training. She is very curious and needs an active family to keep her engaged."
  },
  
  // Treatment
  {
    id: "treat_1",
    type: "treatment",
    ngo: "Paws Rescue Center",
    location: "Downtown Clinic (2 miles away)",
    petName: "Max",
    issue: "Needs emergency orthopedic surgery for a broken leg.",
    urgency: "High",
    raised: 450,
    goal: 1200,
    image: "/pet2.png"
  },
  {
    id: "treat_2",
    type: "treatment",
    ngo: "Hope Animal Shelter",
    location: "Westside Branch (5 miles away)",
    petName: "Daisy",
    issue: "Requires ongoing treatment for severe skin infection and malnutrition.",
    urgency: "Medium",
    raised: 120,
    goal: 500,
    image: "/pet1.png"
  },

  // Breeding
  {
    id: "breed_1",
    type: "breeding",
    name: "Apollo",
    breed: "Siberian Husky",
    age: "3 years",
    gender: "Male",
    pedigree: "AKC Registered",
    image: "/pet1.png",
    bio: "Champion bloodline Husky looking for a suitable mate. Fully health tested."
  },
  {
    id: "breed_2",
    type: "breeding",
    name: "Cleo",
    breed: "Persian",
    age: "2 years",
    gender: "Female",
    pedigree: "CFA Registered",
    image: "/pet2.png",
    bio: "Purebred Persian, very affectionate. Up to date on all vaccinations."
  }
];
