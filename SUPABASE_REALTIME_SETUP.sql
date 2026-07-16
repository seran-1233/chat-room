-- =====================================================
-- Enable Realtime for Chat Application
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run

-- =====================================================
-- Step 1: Enable Realtime on messages table
-- =====================================================
-- This allows the table to broadcast changes via websockets
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- Step 2: Verify Realtime is enabled
-- =====================================================
-- This query will show all tables enabled for Realtime
-- You should see 'messages' in the results
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- =====================================================
-- Step 3: Verify RLS policies exist
-- =====================================================
-- These should already be set up from the previous schema
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';

-- =====================================================
-- IMPORTANT: Realtime Settings in Supabase Dashboard
-- =====================================================
-- After running this SQL, you MUST also:
--
-- 1. Go to: Database > Replication
-- 2. Find the 'messages' table
-- 3. Click the toggle to enable Realtime
-- 4. Save changes
--
-- This is required for Realtime subscriptions to work!
-- =====================================================

-- =====================================================
-- Test: Insert a message to verify everything works
-- =====================================================
-- Uncomment and run this to test:
-- INSERT INTO messages (username, text) 
-- VALUES ('System', 'Realtime is now enabled! 🚀');
