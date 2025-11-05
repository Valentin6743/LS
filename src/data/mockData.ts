import { Task, Event, Friend, Memory, File, FriendRequest, Group, Message } from '../types';

export const mockTasks: Task[] = [];
export const mockEvents: Event[] = [];
export const mockMemories: Memory[] = [];
export const mockFiles: File[] = [];

export const mockInitialFriends: Friend[] = [
  { id: '2', name: 'Lena Schmidt', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena', status: 'online', tag: '#5678' },
  { id: '3', name: 'Tom Wagner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', status: 'away', tag: '#9012' },
];

export const mockFriendRequests: FriendRequest[] = [
  {
    id: 'req1',
    fromUser: { id: '4', name: 'Anna Becker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna', tag: '#4321' },
    toUserId: '1',
    status: 'pending',
  },
];

export const mockGroups: Group[] = [
  {
    id: 'group1',
    name: 'Projekt Alpha',
    icon: '🚀',
    members: ['1', '2'],
    channels: [
      { id: 'g1c1', name: 'allgemein' },
      { id: 'g1c2', name: 'planung' },
    ],
  },
  {
    id: 'group2',
    name: 'Wochenendtrip',
    icon: '✈️',
    members: ['1', '3'],
    channels: [
      { id: 'g2c1', name: 'chat' },
    ],
  },
];

export const mockMessages: Message[] = [
  { id: 'm1', conversationId: '2', senderId: '2', content: 'Hey, wie gehts?', timestamp: new Date(Date.now() - 1000 * 60 * 5), read: false },
  { id: 'm2', conversationId: 'g1c1', senderId: '2', content: 'Willkommen im Projekt!', timestamp: new Date(Date.now() - 1000 * 60 * 10), read: true },
  { id: 'm3', conversationId: 'g1c1', senderId: '1', content: 'Danke! Freut mich, dabei zu sein.', timestamp: new Date(Date.now() - 1000 * 60 * 9), read: true },
];
