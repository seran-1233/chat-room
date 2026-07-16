// Vercel Serverless Function - Get Messages
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Get messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ messages: data });
  }

  if (req.method === 'POST') {
    // Post message
    const { username, text } = req.body;

    if (!username || !text) {
      return res.status(400).json({ error: 'Username and text required' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ username, text }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: data[0] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
