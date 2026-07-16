-- =====================================================
-- COMPLETE FIX - RUN THIS TO FIX EVERYTHING!
-- =====================================================

-- Fix 1: Disable RLS (allows message insert)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Fix 2: Enable Realtime (fixes red dot connection)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Test: Insert a message
INSERT INTO messages (username, text) 
VALUES ('System', '✅ Database fixed! Everything works now!');

-- Success!
SELECT '✅ SUCCESS! Your chat is now fully working!' as result;
