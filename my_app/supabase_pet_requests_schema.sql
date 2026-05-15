-- SQL Schema for Pet Requests
CREATE TABLE IF NOT EXISTS pet_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('adoption', 'breeding')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE pet_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see requests they sent or received" ON pet_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can insert requests" ON pet_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Owners can update request status" ON pet_requests
  FOR UPDATE USING (auth.uid() = owner_id);
