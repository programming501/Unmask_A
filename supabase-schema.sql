-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'educator')),
  name TEXT NOT NULL,
  bio TEXT,
  subjects TEXT, -- Comma-separated subjects for educators
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own profile and all profiles (for marketplace)
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  curriculum_link TEXT,
  exam_date DATE,
  budget_min NUMERIC,
  budget_max NUMERIC,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Students can see their own requests, educators can see open requests
CREATE POLICY "Students can view own requests" ON requests
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Educators can view open requests" ON requests
  FOR SELECT USING (status = 'open');

CREATE POLICY "Students can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own requests" ON requests
  FOR UPDATE USING (auth.uid() = student_id);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  educator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  timeline TEXT NOT NULL,
  study_plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Students can see offers for their requests, educators can see their own offers
CREATE POLICY "Students can view offers for their requests" ON offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests 
      WHERE requests.id = offers.request_id 
      AND requests.student_id = auth.uid()
    )
  );

CREATE POLICY "Educators can view own offers" ON offers
  FOR SELECT USING (auth.uid() = educator_id);

CREATE POLICY "Educators can create offers" ON offers
  FOR INSERT WITH CHECK (auth.uid() = educator_id);

CREATE POLICY "Students can update offers for their requests" ON offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM requests 
      WHERE requests.id = offers.request_id 
      AND requests.student_id = auth.uid()
    )
  );

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  educator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Only participants can view their conversations
CREATE POLICY "Participants can view conversations" ON conversations
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = educator_id);

CREATE POLICY "Conversations can be created" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() = educator_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Only conversation participants can read/write messages
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.student_id = auth.uid() OR conversations.educator_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.student_id = auth.uid() OR conversations.educator_id = auth.uid())
    )
  );

-- Enable Realtime for messages and offers (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE offers;

