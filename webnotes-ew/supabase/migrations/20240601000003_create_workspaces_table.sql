CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add workspace_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Enable realtime for workspaces
alter publication supabase_realtime add table workspaces;

-- Create policies for workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
CREATE POLICY "Users can view their own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workspaces" ON workspaces;
CREATE POLICY "Users can insert their own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workspaces" ON workspaces;
CREATE POLICY "Users can update their own workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workspaces" ON workspaces;
CREATE POLICY "Users can delete their own workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Update tasks policies to include workspace_id check
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Update connections policies
DROP POLICY IF EXISTS "Users can view their own connections" ON connections;
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own connections" ON connections;
CREATE POLICY "Users can insert their own connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own connections" ON connections;
CREATE POLICY "Users can update their own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own connections" ON connections;
CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_id);