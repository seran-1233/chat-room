# Project Structure

This document describes the organization of the real-time chat application codebase.

```
realtime-chat/
│
├── backend/                      # Node.js server
│   ├── src/
│   │   └── server.js            # Main server file with Socket.IO & Express
│   ├── .env.example             # Environment variables template
│   ├── .gitignore               # Backend-specific gitignore
│   ├── package.json             # Backend dependencies
│   ├── supabase_schema.sql      # Database schema for Supabase
│   └── SUPABASE_SETUP.md        # Supabase configuration guide
│
├── frontend/                     # Static web client
│   ├── css/
│   │   └── styles.css           # All styling (dark theme, responsive)
│   ├── js/
│   │   └── app.js               # Socket.IO client logic & UI handlers
│   └── index.html               # Single-page application
│
├── .gitignore                    # Root gitignore
├── prd.md                        # Product Requirements Document
├── PROJECT_STRUCTURE.md          # This file
└── README.md                     # Setup & usage instructions

```

## Backend Architecture

### `server.js`
The main backend file handles:
- **Express server** setup for HTTP endpoints
- **Socket.IO server** for WebSocket connections
- **Supabase client** initialization for database operations
- **In-memory state**: `onlineUsers` (Map), `typingUsers` (Set)

### Socket Events (Server)
| Event | Direction | Description |
|-------|-----------|-------------|
| `user-join` | Client → Server | User joins with username |
| `chat-message` | Client → Server | User sends a message |
| `typing-start` | Client → Server | User starts typing |
| `typing-stop` | Client → Server | User stops typing |
| `disconnect` | Client → Server | User disconnects |
| `chat-history` | Server → Client | Load last 50 messages from DB |
| `user-joined` | Server → All | Broadcast when someone joins |
| `user-left` | Server → All | Broadcast when someone leaves |
| `online-users` | Server → Client | Send current user list |
| `user-typing` | Server → Others | Relay typing indicator |
| `error` | Server → Client | Error notification |

### Database Schema (Supabase)
**Table: `messages`**
- `id` (bigint, PK, auto-increment)
- `username` (text)
- `text` (text)
- `created_at` (timestamptz, default now())

**Indexes:**
- `idx_messages_created_at` on `created_at DESC`

**Row Level Security:**
- Public read & insert policies (for demo)

---

## Frontend Architecture

### `index.html`
- **Join Screen**: Username entry form
- **Chat Screen**: Header, sidebar (online users), messages area, typing indicator, message input

### `styles.css`
- CSS Variables for theming (dark mode)
- Responsive design (mobile-first)
- Animations: message slide-in, typing dots, status pulse
- Flexbox layout for chat interface

### `app.js`
Organized into sections:
1. **Configuration**: Server URL
2. **State Management**: Socket instance, username, typing state
3. **DOM Elements**: Cached references
4. **Utility Functions**: Time formatting, colors, scrolling
5. **Message Rendering**: Add chat/system messages
6. **Online Users**: Update sidebar list
7. **Typing Indicator**: Show who's typing
8. **Socket Handlers**: All Socket.IO event listeners
9. **Form Handlers**: Join & message submission
10. **Initialization**: Start the app

### Key Features
- **Auto-reconnect**: Socket.IO handles reconnection automatically
- **Auto-scroll**: Scrolls to bottom when near the end
- **Duplicate username handling**: Server appends random suffix
- **Typing indicator**: Shows up to 3 users typing
- **Responsive sidebar**: Toggle on mobile
- **Color-coded avatars**: Generated from username

---

## Data Flow

### 1. User Joins
```
User → Enter username → Socket emits 'user-join' →
Server: checks duplicate, saves to Map, fetches history from Supabase →
Server: emits 'chat-history' to user, broadcasts 'user-joined' to all →
Clients: update online users list, show join notification
```

### 2. User Sends Message
```
User → Types & submits → Socket emits 'chat-message' →
Server: broadcasts to all clients immediately →
Server: saves to Supabase asynchronously (non-blocking) →
Clients: display message with timestamp
```

### 3. User Types
```
User → Input changes → Client emits 'typing-start' →
Server: broadcasts 'user-typing' to others →
After 2s idle: Client emits 'typing-stop' →
Clients: update typing indicator
```

### 4. User Disconnects
```
Browser closes / Network drops → Socket disconnects →
Server: removes from Map, broadcasts 'user-left' →
Clients: update online users, show leave notification
```

---

## Technology Stack Summary

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | HTML5, CSS3, Vanilla JS | - |
| Backend | Node.js | 18+ |
| Web Framework | Express | ^4.18 |
| Real-time | Socket.IO | ^4.6 |
| Database | Supabase (Postgres) | Cloud |
| DB Client | @supabase/supabase-js | ^2.39 |
| Environment | dotenv | ^16.3 |
| CORS | cors | ^2.8 |

---

## Future Enhancements (from PRD)

### Stretch Goals (Nice-to-Have)
1. **Private messaging**: Add `to` field in message, filter broadcasts
2. **Multiple rooms**: Add `room` field, use Socket.IO rooms
3. **Supabase Auth**: Replace username-only with email/password login
4. **File sharing**: Use Supabase Storage for image/file uploads
5. **Message pagination**: Load older messages on scroll-up
6. **Read receipts**: Track which users have seen which messages
7. **User profiles**: Store avatar, bio, status in Supabase
8. **Emoji reactions**: Add reactions table with message_id FK
9. **Notifications**: Desktop notifications for mentions
10. **Dark/Light theme toggle**: Add theme switcher

---

## Performance Considerations

### Current Optimizations
- Messages broadcast immediately, DB write is async (non-blocking)
- Only last 50 messages loaded on join (not entire history)
- Typing indicator debounced (2s timeout)
- Auto-scroll only when user is near bottom

### Scalability Limits (MVP)
- In-memory user storage: Lost on server restart
- No horizontal scaling: Single server instance
- No message pagination: UI slows with 1000+ messages
- Public RLS: No access control

### Production Recommendations
- Use Redis for shared state across multiple servers
- Implement Socket.IO sticky sessions with load balancer
- Add message pagination/virtualization in frontend
- Enable Supabase Auth and tighten RLS policies
- Add rate limiting (e.g., max 10 messages/minute/user)
- Monitor with logging service (e.g., Winston + Logtail)
