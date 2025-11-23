/*
  # LifeSync: Initial Comprehensive Schema

  ## Overview
  This migration creates the complete relational database schema for the LifeSync organization system.
  All modules are interconnected through foreign keys and enable shared access via team/friend relationships.

  ## Core Design Principles
  1. Every record belongs to a user or team
  2. All tables have timestamps (created_at, updated_at)
  3. All tables have RLS policies for security
  4. Soft deletes where appropriate (deleted_at)
  5. UUIDs for all primary keys
  6. Proper indexing for performance

  ## New Tables
  - users: Core user accounts with metadata
  - teams: Group organization/collaboration
  - team_members: Manages team membership with roles
  - friends: Social connections between users
  - projects: Project management with status tracking
  - tasks: Tasks linked to projects, habits, and calendar
  - events: Calendar events (tasks, habits, transactions, custom events)
  - habits: Recurring daily/weekly habits with tracking
  - habit_logs: Daily habit completion records
  - transactions: Financial records with categories
  - notes: Diary entries and notes with optional attachments
  - files: File storage metadata
  - messages: Direct messaging between users
  - notifications: Activity notifications for users
  - shared_resources: Manage sharing of calendars, projects, etc.

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to own data or shared resources
  - Teams enable safe multi-user collaboration
  - Friend relationships require mutual agreement

  ## Relationships Summary
  - Tasks → Projects, Habits, Events, Files
  - Events → Calendar aggregation from Tasks, Habits, Transactions
  - Habits → Habit_logs (daily tracking)
  - Transactions → Events (appear in calendar)
  - Notes → Files (attachments)
  - Messages → Direct user-to-user communication
  - Projects → Tasks (hierarchical work breakdown)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE USERS & TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  theme text DEFAULT 'dark',
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team membership with roles (must be created before teams RLS policy)
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND (teams.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM team_members tm2
             WHERE tm2.team_id = teams.id
             AND tm2.user_id = auth.uid()
           ))
    )
  );

-- Now enable RLS policies on teams
CREATE POLICY "Users can view teams they belong to"
  ON teams FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update their team"
  ON teams FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Friend relationships
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friend relationships"
  ON friends FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update friend requests they received"
  ON friends FOR UPDATE
  TO authenticated
  USING (friend_id = auth.uid())
  WITH CHECK (friend_id = auth.uid());

-- ============================================================================
-- PROJECTS & TASKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  color text DEFAULT '#3b82f6',
  start_date date,
  end_date date,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects and shared projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create and update own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Tasks with full hierarchy
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date date,
  start_date date,
  estimated_hours numeric,
  actual_hours numeric,
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  deleted_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks and team tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    assignee_id = auth.uid() OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (projects.owner_id = auth.uid() OR
           (projects.team_id IS NOT NULL AND EXISTS (
             SELECT 1 FROM team_members
             WHERE team_members.team_id = projects.team_id
             AND team_members.user_id = auth.uid()
           )))
    ))
  );

CREATE POLICY "Users can create tasks in their projects"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR assignee_id = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR assignee_id = auth.uid());

-- ============================================================================
-- HABITS & TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text DEFAULT 'other',
  frequency text DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  color text DEFAULT '#10b981',
  goal_value numeric,
  goal_unit text,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can manage own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Daily habit tracking
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  value numeric DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, log_date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can log own habits"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- FINANCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD',
  description text,
  transaction_date date NOT NULL,
  payment_method text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- CALENDAR EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  source_type text NOT NULL CHECK (source_type IN ('task', 'habit', 'transaction', 'event', 'memory')),
  source_id uuid,
  category text,
  color text DEFAULT '#3b82f6',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  all_day boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurrence_rule text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events and shared events"
  ON events FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = events.team_id
      AND team_members.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- NOTES & DIARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  category text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- FILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  mime_type text,
  size integer,
  storage_path text NOT NULL UNIQUE,
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  related_type text CHECK (related_type IN ('note', 'task', 'message')),
  related_id uuid,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- MESSAGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CHECK (sender_id != recipient_id)
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'friend_request', 'message', 'project_update', 'team_invite')),
  title text NOT NULL,
  message text,
  related_type text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SHARED RESOURCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS shared_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shared_with_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('calendar', 'project', 'task')),
  resource_id uuid NOT NULL,
  permission text DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
  created_at timestamptz DEFAULT now(),
  CHECK ((shared_with_user_id IS NOT NULL AND shared_with_team_id IS NULL) OR 
         (shared_with_team_id IS NOT NULL AND shared_with_user_id IS NULL))
);

ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shared resources"
  ON shared_resources FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    shared_with_user_id = auth.uid() OR
    shared_with_team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_events_owner_id ON events(owner_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_source_type ON events(source_type);

CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_log_date ON habit_logs(log_date);

CREATE INDEX idx_transactions_owner_id ON transactions(owner_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_notes_owner_id ON notes(owner_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_team_id ON projects(team_id);

CREATE INDEX idx_habits_owner_id ON habits(owner_id);
CREATE INDEX idx_habits_is_active ON habits(is_active);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
