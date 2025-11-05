export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  tag: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  repeat: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  color?: string;
  calendarType: 'private' | 'friends';
  participants?: string[]; // Array of user IDs
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string; // Can be a friend's ID (for DMs) or a channel ID
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  tag: string;
}

export interface FriendRequest {
  id: string;
  fromUser: Pick<User, 'id' | 'name' | 'avatar' | 'tag'>;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Channel {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  icon?: string;
  members: string[]; // Array of user IDs
  channels: Channel[];
}

export type Conversation = 
  | { type: 'dm'; user: Friend }
  | { type: 'channel'; group: Group; channel: Channel };

export type Mood = 'happy' | 'sad' | 'neutral' | 'excited' | 'stressed';

export interface Memory {
  id: string;
  title: string;
  content: string;
  date: Date;
  mood?: Mood;
  tags?: string[];
  photos?: string[];
}

export interface File {
  id: string;
  name: string;
  size: number; // in bytes
  type: string;
  uploadDate: Date;
  url: string;
  category: string; // Represents the folder
  uploader: string; // Name of the user who uploaded
  description?: string;
}
