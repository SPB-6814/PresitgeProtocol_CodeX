-- SQL Schema for My Pets Section

-- Create the my_pets table
CREATE TABLE IF NOT EXISTS my_pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  animal_type TEXT NOT NULL, -- e.g., 'dog', 'cat'
  breed TEXT,
  gender TEXT,
  age TEXT,
  weight FLOAT,
  location TEXT,
  vaccination_status TEXT,
  diet TEXT[] DEFAULT '{}', -- array of diet items like ['milk', 'roti', 'cereal', 'pedigree']
  diet_status TEXT,
  health_plan TEXT, -- Gemini generated health plan
  grooming_plan TEXT, -- Gemini generated grooming plan
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE my_pets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own pets" ON my_pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets" ON my_pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" ON my_pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" ON my_pets
  FOR DELETE USING (auth.uid() = user_id);
