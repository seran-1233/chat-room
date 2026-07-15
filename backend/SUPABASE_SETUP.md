# Supabase Setup Guide

This guide will help you set up Supabase for the real-time chat application.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (GitHub login recommended)
3. It's completely free for the usage we need

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `realtime-chat` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Choose the closest region to you
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `backend/supabase_schema.sql` in this project
4. Copy all the SQL code and paste it into the Supabase SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this is correct!

## Step 4: Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in the sidebar)
2. Click on **API** in the left menu
3. You'll see two important values:

   **Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   
   **Project API keys**
   - `anon` `public` key - Don't use this in backend
   - `service_role` `secret` key - **Use this one for backend**

4. Copy the **service_role key** (click the eye icon to reveal it)

## Step 5: Configure Your Backend

1. In the `backend` folder, create a file named `.env` (copy from `.env.example`)
2. Add your credentials:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
PORT=3000
```

**Important:** 
- Use the **service_role** key, not the anon key
- Never commit the `.env` file to git (it's in `.gitignore`)
- The service_role key has full access, so keep it secure

## Step 6: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see a `messages` table with columns:
   - `id` (bigint)
   - `username` (text)
   - `text` (text)
   - `created_at` (timestamptz)

3. You can manually insert a test message:
   - Click on the `messages` table
   - Click "Insert row"
   - Fill in `username` and `text`
   - Click "Save"

## Step 7: Check Row Level Security (RLS)

1. Go to **Authentication** > **Policies**
2. You should see two policies on the `messages` table:
   - "Allow public read access" (SELECT)
   - "Allow public insert access" (INSERT)

These policies allow anyone to read and write messages without authentication (suitable for this demo).

## Troubleshooting

### "relation 'messages' does not exist"
- Make sure you ran the SQL schema file in the SQL Editor
- Check the Table Editor to confirm the table was created

### "Invalid API key"
- Make sure you're using the **service_role** key, not the anon key
- Check for extra spaces when copying the key
- Ensure the key is in the `.env` file, not `.env.example`

### "Permission denied"
- Verify RLS policies are created (see Step 7)
- Try disabling RLS temporarily to test: `ALTER TABLE messages DISABLE ROW LEVEL SECURITY;`

## Future Enhancements

When you're ready to add proper authentication:

1. Enable Email/Password auth in Supabase (Authentication > Providers)
2. Create a users table linked to `auth.users`
3. Update RLS policies to check `auth.uid()`
4. Add user registration/login to the frontend

See the comments in `supabase_schema.sql` for SQL examples.

## Useful Supabase Resources

- [Official Documentation](https://supabase.com/docs)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
