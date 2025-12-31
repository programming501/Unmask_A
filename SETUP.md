# Unmask Setup Guide

## Phase 1: Supabase Configuration

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to finish provisioning (~2 minutes)

### 2. Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql` from the project root
3. Paste it into the SQL Editor and click **Run**
4. Verify all tables were created by checking the **Table Editor**:
   - `profiles`
   - `requests`
   - `offers`
   - `conversations`
   - `messages`

### 3. Configure Environment Variables

1. In Supabase, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Enable Email Auth (if not already enabled)

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** provider is enabled
3. For hackathon demo, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Under "Email Auth", toggle off "Confirm email" (optional, for faster testing)

### 5. Test the Setup

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "I'm a Student" or "I'm an Educator"
4. Sign up with a test email
5. Complete onboarding
6. You should land on your dashboard!

## Troubleshooting

- **"Invalid API key"**: Double-check your `.env.local` file has the correct values
- **"Table does not exist"**: Make sure you ran the SQL schema script
- **Auth redirects not working**: Check that your Supabase project URL is correct
- **RLS errors**: The schema includes RLS policies - if you get permission errors, verify the policies were created correctly

## Next Steps

After Phase 1 is working:
- Phase 2: Student request creation
- Phase 3: Educator offers + AI integration
- Phase 4: Chat system
- Phase 5: Polish & demo prep

## Seed Data (Optional)

To populate your database with sample requests for demo purposes:

1. First, create at least one student account (sign up as a student)
2. Go to **SQL Editor** in Supabase
3. Copy and run the contents of `supabase-seed-data.sql`
4. **Important**: The seed script uses `(SELECT id FROM profiles WHERE role = 'student' LIMIT 1)` to get a student ID. If you have multiple students, you may want to manually update the student_id values.

This will create 8 sample requests across different subjects that educators can browse and submit offers for.

