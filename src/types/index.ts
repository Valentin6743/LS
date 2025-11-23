/* ============================================================================
   USERS & AUTHENTICATION
   ============================================================================ */

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  theme: 'dark' | 'light';
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/* ============================================================================
   TEAMS & COLLABORATION
   ============================================================================ */

export interface Team {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

/* ============================================================================
   PROJECTS & TASKS
   ============================================================================ */

export interface Project {
  id: string;
  owner_id: string;
  team_id?: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  color: string;
  start_date?: string;
  end_date?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Task {
  id: string;
  owner_id: string;
  project_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assignee_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  deleted_at?: string;
}

/* ============================================================================
   HABITS & TRACKING
   ============================================================================ */

export interface Habit {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  color: string;
  goal_value?: number;
  goal_unit?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  value: number;
  notes?: string;
  created_at: string;
}

/* ============================================================================
   FINANCES
   ============================================================================ */

export interface Transaction {
  id: string;
  owner_id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  transaction_date: string;
  payment_method?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/* ============================================================================
   CALENDAR EVENTS
   ============================================================================ */

export interface CalendarEvent {
  id: string;
  owner_id: string;
  team_id?: string;
  title: string;
  description?: string;
  source_type: 'task' | 'habit' | 'transaction' | 'event' | 'memory';
  source_id?: string;
  category?: string;
  color: string;
  start_time: string;
  end_time?: string;
  all_day: boolean;
  is_recurring: boolean;
  recurrence_rule?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/* ============================================================================
   NOTES & DIARY
   ============================================================================ */

export type Mood = 'happy' | 'sad' | 'neutral' | 'excited' | 'stressed';

export interface Note {
  id: string;
  owner_id: string;
  title?: string;
  content: string;
  category?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/* ============================================================================
   FILES
   ============================================================================ */

export interface FileRecord {
  id: string;
  owner_id: string;
  name: string;
  mime_type?: string;
  size?: number;
  storage_path: string;
  note_id?: string;
  related_type?: 'note' | 'task' | 'message';
  related_id?: string;
  created_at: string;
  deleted_at?: string;
}

/* ============================================================================
   MESSAGING
   ============================================================================ */

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at?: string;
  created_at: string;
  deleted_at?: string;
}

/* ============================================================================
   NOTIFICATIONS
   ============================================================================ */

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: 'task_assigned' | 'task_completed' | 'friend_request' | 'message' | 'project_update' | 'team_invite';
  title: string;
  message?: string;
  related_type?: string;
  related_id?: string;
  read_at?: string;
  created_at: string;
}

/* ============================================================================
   SHARED RESOURCES
   ============================================================================ */

export interface SharedResource {
  id: string;
  owner_id: string;
  shared_with_user_id?: string;
  shared_with_team_id?: string;
  resource_type: 'calendar' | 'project' | 'task';
  resource_id: string;
  permission: 'view' | 'edit' | 'admin';
  created_at: string;
}
