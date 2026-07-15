-- =====================================================
-- Real-Time Chat Application - Supabase Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to set up the database
-- Project Dashboard > SQL Editor > New Query > Paste and Run

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read messages (for demo purposes)
CREATE POLICY "Allow public read access" ON messages
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert messages (for demo purposes)
CREATE POLICY "Allow public insert access" ON messages
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Optional: Sample data for testing
-- =====================================================
-- Uncomment below to insert some test messages

-- INSERT INTO messages (username, text) VALUES
--   ('Alice', 'Hello everyone!'),
--   ('Bob', 'Hi Alice, how are you?'),
--   ('Alice', 'I''m doing great, thanks!'),
--   ('Charlie', 'Hey folks! Just joined the chat.'),
--   ('Bob', 'Welcome Charlie!');

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the setup worked correctly

-- Check if table exists and view structure
-- SELECT * FROM information_schema.columns WHERE table_name = 'messages';

-- View all messages
-- SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Count total messages
-- SELECT COUNT(*) as total_messages FROM messages;

-- =====================================================
-- Future Enhancement: Add user authentication
-- =====================================================
-- When you're ready to add Supabase Auth, you can:
-- 1. Create a users table linked to auth.users
-- 2. Update RLS policies to check auth.uid()
-- 3. Add foreign key from messages.user_id to auth.users
--
-- Example:
-- ALTER TABLE messages ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- CREATE POLICY "Users can only insert their own messages" ON messages
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
