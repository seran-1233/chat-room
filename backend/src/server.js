require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory storage for online users
const onlineUsers = new Map(); // socket.id -> username
const typingUsers = new Set(); // Set of usernames currently typing

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✓ New connection: ${socket.id}`);

  // Handle user join
  socket.on('user-join', async (username) => {
    try {
      // Handle duplicate usernames
      let finalUsername = username;
      const existingUsernames = Array.from(onlineUsers.values());
      
      if (existingUsernames.includes(username)) {
        const suffix = Math.floor(Math.random() * 1000);
        finalUsername = `${username}${suffix}`;
      }

      // Store user in memory
      onlineUsers.set(socket.id, finalUsername);

      // Fetch last 50 messages from Supabase
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        socket.emit('chat-history', []);
      } else {
        // Send messages in chronological order (oldest first)
        socket.emit('chat-history', messages.reverse());
      }

      // Notify all clients about the new user
      io.emit('user-joined', {
        username: finalUsername,
        onlineUsers: Array.from(onlineUsers.values())
      });

      // Send current online users to the joining client
      socket.emit('online-users', Array.from(onlineUsers.values()));

      console.log(`User joined: ${finalUsername}`);
    } catch (error) {
      console.error('Error in user-join:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle chat messages
  socket.on('chat-message', async (data) => {
    try {
      const username = onlineUsers.get(socket.id);
      
      if (!username) {
        socket.emit('error', { message: 'User not registered' });
        return;
      }

      const messageData = {
        username: username,
        text: data.text,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all clients immediately (don't wait for DB)
      io.emit('chat-message', messageData);

      // Save to Supabase asynchronously
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            username: username,
            text: data.text
          }
        ]);

      if (error) {
        console.error('Error saving message to Supabase:', error);
      }
    } catch (error) {
      console.error('Error in chat-message:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing-start', () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      typingUsers.add(username);
      socket.broadcast.emit('user-typing', {
        username: username,
        isTyping: true
      });
    }
  });

  socket.on('typing-stop', () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      typingUsers.delete(username);
      socket.broadcast.emit('user-typing', {
        username: username,
        isTyping: false
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    
    if (username) {
      onlineUsers.delete(socket.id);
      typingUsers.delete(username);

      // Notify all clients about user leaving
      io.emit('user-left', {
        username: username,
        onlineUsers: Array.from(onlineUsers.values())
      });

      console.log(`User left: ${username}`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Supabase URL: ${supabaseUrl ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
