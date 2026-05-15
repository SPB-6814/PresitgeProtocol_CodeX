-- 1. Add lat and lng columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS lat FLOAT8;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS lng FLOAT8;

-- 2. Allow users to update their own posts
CREATE POLICY "Users can update own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Allow users to delete their own posts
CREATE POLICY "Users can delete own posts" 
ON posts FOR DELETE 
USING (auth.uid() = user_id);
