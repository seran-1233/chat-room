# 💬 Real-Time Chat Application

A WebSocket-based real-time chat application built with Socket.IO, Node.js, and Supabase. Features instant messaging, typing indicators, online presence, and persistent chat history.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### Core Features (Implemented)
- ✅ Real-time bidirectional communication via WebSocket
- ✅ Instant message broadcasting to all connected users
- ✅ Online users list with live presence tracking
- ✅ "User is typing..." indicator
- ✅ Join/leave notifications
- ✅ Persistent chat history (last 50 messages stored in Supabase)
- ✅ Auto-reconnection on connection drop
- ✅ Duplicate username handling
- ✅ Responsive UI (mobile-friendly)
- ✅ Dark theme with smooth animations

### Technical Highlights
- WebSocket communication with Socket.IO (automatic fallback to polling)
- Postgres database via Supabase with Row Level Security
- Modern vanilla JavaScript (no framework dependencies)
- Clean separation of frontend and backend
- In-memory presence tracking for low latency
- Asynchronous database writes (non-blocking broadcasts)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Supabase Account** (free) ([Sign up](https://supabase.com))
- **Git** (optional, for cloning)

### Installation

1. **Clone or Download the Project**
   ```bash
   git clone <your-repo-url>
   cd realtime-chat
   ```
   Or download and extract the ZIP file.

2. **Set Up Supabase Database**
   
   Follow the detailed guide: **[backend/SUPABASE_SETUP.md](backend/SUPABASE_SETUP.md)**
   
   Quick summary:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `backend/supabase_schema.sql` in the SQL Editor
   - Copy your Project URL and Service Role Key

3. **Configure Backend Environment**
   ```bash
   cd backend
   copy .env.example .env    # Windows CMD
   # OR
   cp .env.example .env      # Git Bash/PowerShell
   ```
   
   Edit `backend/.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   PORT=3000
   ```

4. **Install Backend Dependencies**
   ```bash
   npm install
   ```

5. **Start the Backend Server**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Server running on http://localhost:3000
   Supabase URL: Configured
   ```

6. **Open the Frontend**
   
   Simply open `frontend/index.html` in your browser, or use a simple HTTP server:
   
   **Option A: Direct file open**
   - Navigate to `frontend` folder
   - Double-click `index.html`
   
   **Option B: Using Python (recommended for development)**
   ```bash
   cd frontend
   python -m http.server 8080
   # Open http://localhost:8080 in browser
   ```
   
   **Option C: Using VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

### Quick Start Scripts

**Windows Users:**
```bash
# PowerShell
.\start.ps1

# OR Command Prompt
start.bat
```

These scripts automatically:
- Check Node.js installation
- Install dependencies if needed
- Verify environment configuration
- Start the backend server

## 📖 Usage

1. **Join the Chat**
   - Enter your desired username
   - Click "Join Chat"
   - If the username is taken, a random suffix will be added

2. **Send Messages**
   - Type in the input box at the bottom
   - Press Enter or click "Send"
   - Your message appears instantly for all users

3. **View Online Users**
   - Check the sidebar (left) for all connected users
   - Your username is highlighted
   - Toggle sidebar on mobile with the arrow button

4. **Typing Indicator**
   - Start typing to show "X is typing..." to others
   - Indicator disappears after 2 seconds of inactivity

5. **Reconnection**
   - If disconnected, Socket.IO automatically reconnects
   - Chat history reloads on reconnection

## 🧪 Testing

### Multi-User Testing (Same Machine)

1. Start the backend server
2. Open `frontend/index.html` in multiple browser windows/tabs
3. Use different usernames in each window
4. Test messaging, typing indicators, and presence

### Multi-Device Testing (Local Network)

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Linux/Mac
   ifconfig
   # or
   ip addr show
   ```

2. Update `frontend/js/app.js` temporarily:
   ```javascript
   const SERVER_URL = 'http://192.168.1.100:3000';  // Use your IP
   ```

3. On other devices (same network):
   - Access the frontend via your IP: `http://192.168.1.100:8080`

### Testing Checklist

- [ ] Two users can send messages in real-time
- [ ] Online users list updates on join/leave
- [ ] Typing indicator appears and disappears correctly
- [ ] Messages persist after browser refresh
- [ ] System shows join/leave notifications
- [ ] Auto-reconnect works after network drop
- [ ] Mobile responsive layout works on phone
- [ ] Duplicate usernames get auto-suffixed

## 📁 Project Structure

```
realtime-chat/
├── backend/
│   ├── src/
│   │   └── server.js           # Main server with Socket.IO & Express
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Backend dependencies
│   ├── supabase_schema.sql     # Database schema
│   └── SUPABASE_SETUP.md       # Supabase configuration guide
├── frontend/
│   ├── css/
│   │   └── styles.css          # All styling
│   ├── js/
│   │   └── app.js              # Socket.IO client & UI logic
│   └── index.html              # Single-page application
├── prd.md                      # Product Requirements Document
├── PROJECT_STRUCTURE.md        # Architecture documentation
├── DEPLOYMENT.md               # Deployment guides
├── README.md                   # This file
├── start.ps1                   # PowerShell startup script
└── start.bat                   # Windows CMD startup script
```

See **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** for detailed architecture.

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | Lightweight client |
| **Backend** | Node.js 18+, Express | HTTP server |
| **Real-time** | Socket.IO 4.6+ | WebSocket communication |
| **Database** | Supabase (Postgres) | Message persistence |
| **Hosting** | Render/Railway/Vercel | Cloud deployment (optional) |

### Dependencies

**Backend:**
- `express` - Web framework
- `socket.io` - Real-time engine
- `@supabase/supabase-js` - Database client
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing

**Frontend:**
- Socket.IO client (CDN)
- No build tools or bundlers required

## 🌐 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for comprehensive guides covering:
- Render (free hosting)
- Railway (easy deployment)
- Vercel + Railway (frontend/backend split)
- Self-hosted VPS (Nginx + PM2)
- Environment variable configuration
- HTTPS/SSL setup
- Troubleshooting

## 📊 Performance & Scalability

### Current Configuration (MVP)
- **Latency**: <200ms on localhost
- **Concurrent Users**: 10-20 tested
- **Message History**: Last 50 messages loaded
- **Storage**: In-memory presence + Supabase persistence

### Scaling Recommendations (Production)

For 100+ concurrent users:
1. Use Redis for shared state across multiple servers
2. Enable Socket.IO sticky sessions with load balancer
3. Add message pagination/virtualization
4. Implement rate limiting (e.g., 10 messages/min/user)
5. Use CDN for frontend assets

See **[PROJECT_STRUCTURE.md#Performance Considerations](PROJECT_STRUCTURE.md)** for details.

## 🔒 Security Notes

### Current Setup (Demo-friendly)
- ⚠️ No authentication (username only)
- ⚠️ Public read/write access to messages table
- ⚠️ CORS allows all origins (`*`)

### Production Recommendations
- ✅ Enable Supabase Auth (email/password or magic link)
- ✅ Tighten Row Level Security policies
- ✅ Restrict CORS to specific domains
- ✅ Validate and sanitize all user input
- ✅ Rate-limit Socket.IO events
- ✅ Use HTTPS in production
- ✅ Never expose `SUPABASE_SERVICE_KEY` in frontend

## 🐛 Troubleshooting

### Backend won't start

**"Cannot find module"**
```bash
cd backend
npm install
```

**"Invalid Supabase credentials"**
- Check `backend/.env` file exists
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Use **service_role** key, not **anon** key
- See `backend/SUPABASE_SETUP.md`

**"Port 3000 already in use"**
```bash
# Change PORT in backend/.env
PORT=3001
# Or kill the process using port 3000
```

### Frontend issues

**"Connection failed" or "Disconnected"**
- Ensure backend is running: `http://localhost:3000/health`
- Check browser console (F12) for errors
- Verify `SERVER_URL` in `frontend/js/app.js` matches backend

**"Messages not appearing"**
- Open browser console to check for errors
- Verify WebSocket connection in Network tab (WS)
- Check multiple users are using different usernames

**"Chat history not loading"**
- Verify Supabase setup: `backend/SUPABASE_SETUP.md`
- Check backend logs for database errors
- Test Supabase connection in Supabase dashboard

### Database issues

**"relation 'messages' does not exist"**
- Run `backend/supabase_schema.sql` in Supabase SQL Editor
- Verify table created in Table Editor

**"Permission denied for table messages"**
- Check Row Level Security policies are enabled
- Verify policies allow public insert/select
- See `backend/supabase_schema.sql` for policy code

## 🎯 Future Enhancements

See **[prd.md](prd.md)** for full list of stretch goals.

### Planned Features
- [ ] Private 1-to-1 messaging
- [ ] Multiple chat rooms/channels
- [ ] Supabase Auth integration (email/password login)
- [ ] Image/file sharing via Supabase Storage
- [ ] Message pagination (load older messages)
- [ ] Read receipts
- [ ] Emoji reactions
- [ ] User profiles & avatars
- [ ] Desktop notifications
- [ ] Dark/light theme toggle

## 📝 License

MIT License - feel free to use this project for learning or as a base for your own applications.

## 🤝 Contributing

This is a mini project for educational purposes. Feel free to:
- Fork and modify for your own use
- Submit issues for bugs
- Suggest features via pull requests

## 📚 Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [WebSocket Protocol (RFC 6455)](https://datatracker.ietf.org/doc/html/rfc6455)

## 👤 Author

**Your Name**
- Project: Real-Time Chat Application
- Status: In Development (Phase 7/9)
- Last Updated: July 2026

## 🙏 Acknowledgments

- Socket.IO team for the excellent real-time engine
- Supabase for managed Postgres with generous free tier
- All open-source contributors who made this possible

---

**Need Help?** Check these resources in order:
1. This README (you are here)
2. `backend/SUPABASE_SETUP.md` - Database setup
3. `PROJECT_STRUCTURE.md` - Architecture details
4. `DEPLOYMENT.md` - Hosting guides
5. `prd.md` - Full project requirements

**Ready to start?** Run `.\start.ps1` (PowerShell) or `start.bat` (CMD) on Windows!
