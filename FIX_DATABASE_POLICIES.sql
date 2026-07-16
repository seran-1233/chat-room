-- =====================================================
-- FIX DATABASE POLICIES FOR REALTIME CHAT
-- =====================================================
-- Run this in Supabase SQL Editor to fix "Failed to send message" error

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON messages;
DROP POLICY IF EXISTS "Allow public insert access" ON messages;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow ANYONE to read messages
CREATE POLICY "Enable read access for all users"
ON messages FOR SELECT
USING (true);

-- Create policy to allow ANYONE to insert messages
CREATE POLICY "Enable insert access for all users"
ON messages FOR INSERT
WITH CHECK (true);

-- Verify policies were created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'messages';

-- Enable Realtime (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Test: Insert a message to verify it works
INSERT INTO messages (username, text) 
VALUES ('System', 'Database policies fixed! ✅');

-- Success message
SELECT 'SUCCESS! Policies created and tested!' as status;
