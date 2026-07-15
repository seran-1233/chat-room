# Product Requirements Document (PRD)
## Real-Time Chat Application

**Version:** 1.1
**Owner:** [Your Name]
**Status:** In Development
**Last Updated:** July 2026

---

## 1. Purpose

Build a web-based real-time chat application that allows multiple users to communicate instantly using WebSocket-based bidirectional communication, with persistent chat history stored in Supabase. This document defines the scope, features, technical requirements, and success criteria for the mini project.

---

## 2. Problem Statement

Traditional web apps rely on HTTP request-response cycles, which are inefficient for real-time use cases like messaging (require polling, cause delay, waste bandwidth). Users need a lightweight app where messages appear instantly for all participants without refreshing the page, and where conversations aren't lost when a user reconnects.

---

## 3. Goals

| Goal | Success Metric |
|---|---|
| Enable real-time messaging | Message delivery latency < 200ms on localhost |
| Support multiple concurrent users | At least 10 simultaneous connections tested |
| Provide presence awareness | Online users list updates within 1s of join/leave |
| Persist chat history | Last 50 messages reload correctly after refresh/reconnect |
| Demonstrate WebSocket concept clearly | Working demo + report explaining handshake/events |

### Non-Goals (Out of Scope for v1)
- End-to-end encryption
- Mobile native app
- Voice/video calling
- Message search
- Full user authentication (login/password) — v1 uses simple display names only

---

## 4. Target Users

- Primary: Evaluator/instructor assessing the mini project
- Secondary: Small group of test users (classmates) trying the chat in multiple browser tabs/devices on the same network

---

## 5. User Stories

| ID | As a... | I want to... | So that... | Status |
|---|---|---|---|---|
| US-1 | User | Enter a username and join the chat | I can identify myself to others | Done |
| US-2 | User | Send a text message | Others see it instantly | Done |
| US-3 | User | See who's online | I know who I'm chatting with | Done |
| US-4 | User | See when someone is typing | The conversation feels natural | Done |
| US-5 | User | Get notified when someone joins/leaves | I stay aware of room activity | Done |
| US-6 | User | See past messages after refresh | I don't lose chat history | Done (via Supabase) |
| US-7 (stretch) | User | Send a message to one specific person | I can have private conversations | Not started |
| US-8 (stretch) | User | Join a specific chat room | I can separate conversations by topic | Not started |
| US-9 (stretch) | User | Log in securely | My identity is verified | Not started |

---

## 6. Functional Requirements

### Must-Have (MVP) — Complete
1. User can join the chat by entering a display name.
2. User can send and receive text messages in real time.
3. All connected clients see messages broadcast instantly.
4. System displays join/leave notifications.
5. System shows a live list of online users.
6. System shows "X is typing..." indicator.
7. Each message displays sender name and timestamp.
8. Chat messages persist in Supabase and reload on join.

### Should-Have
9. Basic input validation (empty message not sent, username required).
10. Auto-scroll to latest message.
11. Responsive UI (usable on mobile browser).
12. Duplicate username handling (auto-suffix).

### Nice-to-Have (Stretch Goals)
13. Private 1-to-1 messaging.
14. Multiple chat rooms/channels.
15. Supabase Auth for login (email or magic link).
16. Image/file sharing via Supabase Storage.
17. Infinite scroll / "load older messages" pagination.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Message delivery under 200ms on local network |
| Scalability | Should handle 10–20 concurrent users for demo purposes |
| Reliability | Auto-reconnect if WebSocket connection drops (handled by Socket.IO) |
| Usability | Simple, distraction-free UI; no login friction for MVP |
| Portability | Runs on any machine with Node.js installed |
| Data Persistence | Messages stored in Supabase Postgres; survive server restarts |
| Maintainability | Modular code — separate client/server, clear file structure |

---

## 8. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Lightweight, no build step needed |
| Backend | Node.js + Express | Simple server setup, widely used |
| Real-time layer | Socket.IO | Handles WebSocket + fallback + reconnection automatically |
| Database | Supabase (Postgres) | Managed Postgres with free tier, instant REST/SQL access, built-in auth/storage available for future stretch goals |
| DB Client | @supabase/supabase-js | Official JS client for querying Supabase from Node.js |
| Hosting (optional) | Render/Railway (backend), Vercel/Netlify (static frontend) | Free tier available for demo deployment |

> **Why Supabase over MongoDB?**
> Supabase gives a hosted Postgres database with a generous free tier, a simple JS SDK, and a built-in SQL editor for setup — no local DB installation needed. It also opens an easy path to add Auth and file Storage later without switching providers.

---

## 9. System Architecture (High Level)

```
Client (Browser) <──WebSocket──> Node.js Server (Socket.IO)
                                        │
                                        ▼
                              Supabase (Postgres DB)
                              - messages table
                              - insert on every chat-message
                              - select last 50 on join
```

- Server maintains an in-memory map of **currently connected** users (`socket.id → username`) for presence/typing features.
- Server maintains a **persistent** record of all messages in Supabase's `messages` table.
- On join, server queries Supabase for the last 50 messages and sends them only to the joining client (`chat-history` event).
- On every new message, server broadcasts to all clients via Socket.IO **and** inserts a row into Supabase — these two happen independently so the live broadcast isn't blocked waiting on the DB write.

---

## 10. Data Model

**Table: `messages`** (Supabase/Postgres)

| Column | Type | Notes |
|---|---|---|
| `id` | bigint, identity | Primary key, auto-increment |
| `username` | text | Sender's display name |
| `text` | text | Message content |
| `created_at` | timestamptz | Defaults to `now()` |

Row Level Security (RLS) is enabled with permissive public read/insert policies for demo purposes — see `supabase_schema.sql`.

---

## 11. Milestones & Timeline

| Phase | Task | Status |
|---|---|---|
| 1 | Setup project, Node server, Socket.IO connection | Done |
| 2 | Implement join + broadcast messaging | Done |
| 3 | Add typing indicator + online users list | Done |
| 4 | UI styling + responsiveness | Done |
| 5 | Set up Supabase project + schema | Done |
| 6 | Integrate Supabase persistence (save + load history) | Done |
| 7 | Testing with multiple clients + bug fixes | In progress |
| 8 (stretch) | Private messaging / rooms / Supabase Auth | Not started |
| 9 | Write report/documentation + prepare demo | Not started |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WebSocket connection drops | Socket.IO auto-reconnect handles this by default |
| Duplicate usernames causing confusion | Auto-append short suffix if name is taken |
| Supabase write fails silently | Log errors server-side; broadcast still succeeds even if DB insert fails |
| Exposing Supabase keys in frontend | Only the backend holds the Supabase key (via `.env`); frontend never talks to Supabase directly |
| Server crash on many messages | Basic error handling with try/catch around socket + Supabase calls |
| Scope creep (adding too many stretch features) | Lock MVP scope first, treat rest as optional |

---

## 13. Success Criteria / Definition of Done

- [x] Two or more users can chat in real time across different browser tabs/devices
- [x] Online users list and typing indicator work correctly
- [x] Join/leave notifications appear
- [x] Messages persist in Supabase and reload after refresh
- [ ] No crash on disconnect/reconnect (needs more testing)
- [ ] Code is documented and demo-ready
- [ ] Project report explains WebSocket concept, architecture, and Supabase integration

---

## 14. Open Questions

- Should RLS policies be tightened (e.g., require Supabase Auth) before final submission, or is public read/insert acceptable for a mini project demo?
- Is deployment required, or is a localhost demo sufficient for evaluation?
- Single global chat room, or should rooms be part of the final submission?