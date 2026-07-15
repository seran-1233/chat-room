# Deployment Guide

This guide covers deploying the real-time chat application to production environments.

## Prerequisites

- Supabase project set up (see `backend/SUPABASE_SETUP.md`)
- Git repository (optional but recommended)
- Accounts on hosting platforms (see options below)

---

## Option 1: Deploy to Render (Recommended)

### Backend Deployment

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Or use "Deploy from GitHub"

3. **Configure Service**
   ```
   Name: realtime-chat-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_service_key
     PORT=10000
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Note your backend URL: `https://realtime-chat-backend.onrender.com`

### Frontend Deployment

1. **Update Frontend Configuration**
   - Edit `frontend/js/app.js`
   - Change `SERVER_URL` to your Render backend URL:
     ```javascript
     const SERVER_URL = 'https://realtime-chat-backend.onrender.com';
     ```

2. **Deploy to Render Static Site**
   - Click "New +" → "Static Site"
   - Connect repository
   - Configure:
     ```
     Name: realtime-chat-frontend
     Root Directory: frontend
     Build Command: (leave empty)
     Publish Directory: .
     ```

3. **Access Your App**
   - Your frontend URL: `https://realtime-chat-frontend.onrender.com`

**Note:** Render free tier may spin down after 15 min of inactivity (cold starts).

---

## Option 2: Deploy to Railway

### Backend Deployment

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Railway auto-detects Node.js
   - Set root directory: `backend`
   - Add environment variables:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_service_key
     ```

4. **Generate Domain**
   - Go to Settings → Generate Domain
   - Note your URL: `https://xxx.railway.app`

### Frontend Deployment

Same as Render static site option, or use Vercel/Netlify (see below).

---

## Option 3: Vercel (Frontend) + Railway (Backend)

### Backend: Deploy to Railway
(See Option 2 above)

### Frontend: Deploy to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your Git repository

3. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: frontend
   Build Command: (leave empty)
   Output Directory: .
   ```

4. **Update SERVER_URL**
   - Before deploying, update `frontend/js/app.js`:
     ```javascript
     const SERVER_URL = 'https://your-backend.railway.app';
     ```

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at: `https://your-app.vercel.app`

---

## Option 4: Self-Hosted (VPS)

### Requirements
- Ubuntu 22.04 LTS (or similar)
- Node.js 18+
- Nginx (reverse proxy)
- PM2 (process manager)
- Domain name (optional)

### Backend Setup

1. **Connect to Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt update
   sudo apt install nodejs nginx certbot python3-certbot-nginx
   sudo npm install -g pm2
   ```

3. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/realtime-chat.git
   cd realtime-chat/backend
   npm install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Add your Supabase credentials
   ```

5. **Start with PM2**
   ```bash
   pm2 start src/server.js --name chat-backend
   pm2 save
   pm2 startup
   ```

### Nginx Configuration

1. **Create Nginx Config**
   ```bash
   sudo nano /etc/nginx/sites-available/chat
   ```

2. **Add Configuration**
   ```nginx
   # Backend (WebSocket support)
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   
   # Frontend
   server {
       listen 80;
       server_name chat.yourdomain.com;
       root /var/www/realtime-chat/frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/chat /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL (Optional but Recommended)**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com -d chat.yourdomain.com
   ```

5. **Update Frontend**
   - Edit `/var/www/realtime-chat/frontend/js/app.js`:
     ```javascript
     const SERVER_URL = 'https://api.yourdomain.com';
     ```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (secret!) | `eyJhbGc...` |
| `PORT` | Server port (default: 3000) | `3000` |

### Frontend (app.js)

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_URL` | Backend WebSocket endpoint | `http://localhost:3000` |

---

## CORS Configuration

If frontend and backend are on different domains, ensure CORS is properly configured:

**Backend (`server.js`):**
```javascript
const io = new Server(server, {
  cors: {
    origin: "https://your-frontend-domain.com",  // Or "*" for any
    methods: ["GET", "POST"]
  }
});
```

---

## Testing Deployment

1. **Health Check**
   ```bash
   curl https://your-backend-url/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **WebSocket Test**
   - Open frontend URL in browser
   - Open browser console (F12)
   - You should see: "Connected to server"

3. **Multi-User Test**
   - Open frontend in 2+ browser tabs/devices
   - Join with different usernames
   - Send messages, verify real-time sync

---

## Monitoring & Logs

### Render
- Dashboard → Your Service → Logs tab
- View real-time logs

### Railway
- Project → Service → Deployments → View Logs

### PM2 (Self-hosted)
```bash
pm2 logs chat-backend
pm2 monit
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### "Connection failed" Error
- Check backend is running: `curl https://backend-url/health`
- Verify `SERVER_URL` in frontend matches backend URL
- Check CORS settings in `server.js`

### WebSocket Not Connecting
- Ensure WebSocket support in proxy (Nginx: `proxy_set_header Upgrade`)
- Some hosting platforms require specific WS configuration

### Messages Not Persisting
- Verify Supabase connection: Check backend logs
- Test Supabase credentials: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Confirm RLS policies allow insert (see `supabase_schema.sql`)

### High Latency
- Choose server region closest to users
- Use CDN for static frontend files (Vercel/Cloudflare)
- Consider Redis for session storage if scaling

---

## Security Checklist

- [ ] Use HTTPS in production (not HTTP)
- [ ] Never expose `SUPABASE_SERVICE_KEY` in frontend
- [ ] Set strict CORS origin (not "*") in production
- [ ] Enable Supabase RLS with proper policies
- [ ] Rate-limit Socket.IO events (add middleware)
- [ ] Validate/sanitize user input (username, messages)
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated (`npm audit`)

---

## Scaling Considerations

For production with 100+ concurrent users:

1. **Load Balancing**
   - Use Socket.IO with Redis adapter
   - Enable sticky sessions

2. **Database**
   - Add indexes on frequently queried columns
   - Archive old messages
   - Use connection pooling

3. **CDN**
   - Serve static frontend via Cloudflare/Vercel Edge

4. **Monitoring**
   - Add APM (Application Performance Monitoring)
   - Set up error tracking (Sentry, Rollbar)

---

## Useful Commands

```bash
# Update deployment (Railway/Render)
git add .
git commit -m "Update"
git push origin main
# Auto-deploys on push

# Restart PM2 service
pm2 restart chat-backend

# View all PM2 processes
pm2 list

# Stop service
pm2 stop chat-backend
pm2 delete chat-backend
```

---

## Cost Estimates (Free Tiers)

| Platform | Backend | Frontend | Database | Notes |
|----------|---------|----------|----------|-------|
| **Render** | Free (750h/mo) | Free | Supabase Free | Sleeps after 15min idle |
| **Railway** | $5 credit/mo | N/A | Supabase Free | Pay per usage after credit |
| **Vercel + Railway** | $5/mo | Free | Supabase Free | Good combo |
| **Self-hosted VPS** | ~$5/mo | ~$5/mo | Supabase Free | DigitalOcean/Linode |

All options include **Supabase Free Tier**: 500 MB database, 50,000 monthly active users, unlimited API requests.
