# 🔑 HOW TO GET YOUR SUPABASE ANON KEY

## 📋 STEP-BY-STEP INSTRUCTIONS:

---

### **STEP 1: Open Supabase Dashboard**

Click this link (I'll open it for you):
👉 https://supabase.com/dashboard/project/jgyvmrhjmjsswyqdglbp/settings/api

---

### **STEP 2: Find "Project API keys" Section**

On the page, scroll down until you see:

```
Configuration
├── General
├── Database
├── API          ← YOU ARE HERE
├── Authentication
└── Storage
```

Under **API** tab, you'll see:

```
Project URL
https://jgyvmrhjmjsswyqdglbp.supabase.co

Project API keys
```

---

### **STEP 3: Look at "Project API keys" Section**

You will see **TWO** keys listed:

```
┌─────────────────────────────────────────────────────┐
│ Project API keys                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ anon                                                │
│ public                                              │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiO... │
│                                            [📋 Copy]│ ← CLICK THIS!
│                                                     │
│ service_role                                        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiO... │
│                                            [📋 Copy]│ ← NOT THIS!
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **STEP 4: Copy the "anon public" Key**

1. **Find** the first key labeled **"anon"** or **"anon public"**
2. **Click** the **[📋 Copy]** button on the RIGHT side
3. The key is now copied to your clipboard!

**✅ The copied key looks like:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneXZtcmhqbWpzc3d5cWRnbGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMDcxOTUsImV4cCI6MjA5OTY4MzE5NX0.xyz123abc...
```

**(Very long string, 200+ characters)**

---

### **STEP 5: Paste It Here**

Come back to this chat and paste the key!

---

## ⚠️ IMPORTANT:

- ✅ **USE:** "anon" or "anon public" key (first one)
- ❌ **DON'T USE:** "service_role" key (second one - this is secret!)

---

## 🎯 WHAT EACH KEY IS FOR:

| Key | Name | Use |
|-----|------|-----|
| ✅ | **anon public** | Frontend (safe to use in browser) |
| ❌ | **service_role** | Backend only (secret, never expose!) |

---

## 📸 VISUAL GUIDE:

Look for this on the page:

```
API Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
https://jgyvmrhjmjsswyqdglbp.supabase.co
                                   [Copy]

Project API keys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

anon
public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                   [Copy] ← THIS!

service_role  
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                   [Copy] ← NOT THIS!
```

---

## 🚀 AFTER YOU PASTE THE KEY:

I will:
1. ✅ Update your frontend code with correct key
2. ✅ Push to GitHub
3. ✅ Vercel auto-deploys
4. ✅ Your chat shows 🟢 "Connected"!

---

**Go get the key now!** 🔑
