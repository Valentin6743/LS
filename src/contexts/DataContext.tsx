import React, { createContext, useContext, useState } from 'react';
import { Task, Event, Friend, Memory, File as FileType, FriendRequest, Group, Message } from '../types';
import { 
  mockTasks, 
  mockEvents, 
  mockMemories, 
  mockFiles, 
  mockInitialFriends, 
  mockFriendRequests, 
  mockGroups, 
  mockMessages 
} from '../data/mockData';
import { addDays } from 'date-fns';

interface DataContextType {
  tasks: Task[];
  events: Event[];
  memories: Memory[];
  files: FileType[];
  friends: Friend[];
  friendRequests: FriendRequest[];
  groups: Group[];
  messages: Message[];

  addTask: (taskData: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (taskData: Omit<Task, 'completed'>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  addEvent: (eventData: Omit<Event, 'id' | 'color'>) => void;
  updateEvent: (eventData: Omit<Event, 'color'>) => void;
  deleteEvent: (id: string) => void;

  addMemory: (memoryData: Omit<Memory, 'id'>) => void;
  updateMemory: (memoryData: Memory) => void;
  deleteMemory: (id: string) => void;

  addFile: (fileData: Omit<FileType, 'id' | 'uploadDate' | 'uploader' | 'size' | 'type' | 'url'>, uploaderName: string) => void;
  deleteFile: (id: string) => void;

  addFriend: (tag: string) => void;
  handleFriendRequest: (requestId: string, action: 'accept' | 'decline') => void;
  sendMessage: (content: string, conversationId: string, senderId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [memories, setMemories] = useState<Memory[]>(mockMemories);
  const [files, setFiles] = useState<FileType[]>(mockFiles);
  const [friends, setFriends] = useState<Friend[]>(mockInitialFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // --- Task Logic ---
  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...taskData, id: Date.now().toString(), completed: false };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (taskData: Omit<Task, 'completed'>) => {
    setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.repeat && !task.completed) {
      const nextDueDate = task.dueDate ? addDays(task.dueDate, 1) : addDays(new Date(), 1);
      const repeatedTask: Task = { ...task, id: Date.now().toString(), completed: false, dueDate: nextDueDate };
      setTasks(prev => [...prev.map(t => t.id === id ? {...t, completed: true} : t), repeatedTask]);
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  // --- Event Logic ---
  const addEvent = (eventData: Omit<Event, 'id' | 'color'>) => {
    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const newEvent: Event = { ...eventData, id: Date.now().toString(), color: colors[Math.floor(Math.random() * colors.length)] };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = (eventData: Omit<Event, 'color'>) => {
    setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // --- Memory Logic ---
  const addMemory = (memoryData: Omit<Memory, 'id'>) => {
    const newMemory: Memory = { ...memoryData, id: Date.now().toString() };
    setMemories(prev => [newMemory, ...prev]);
  };

  const updateMemory = (memoryData: Memory) => {
    setMemories(prev => prev.map(m => m.id === memoryData.id ? memoryData : m));
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };
  
  // --- File Logic ---
  const addFile = (fileData: Omit<FileType, 'id' | 'uploadDate' | 'uploader' | 'size' | 'type' | 'url'>, uploaderName: string) => {
    const newFile: FileType = {
      ...fileData,
      id: Date.now().toString(),
      uploadDate: new Date(),
      uploader: uploaderName,
      size: Math.floor(Math.random() * 5 * 1024 * 1024),
      type: ['image/jpeg', 'application/pdf', 'application/zip'][Math.floor(Math.random() * 3)],
      url: '#',
    };
    setFiles(prev => [newFile, ...prev]);
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- Friend/Chat Logic ---
  const addFriend = (tag: string) => {
    console.log(`Simulating friend request to ${tag}`);
    alert(`Freundschaftsanfrage an ${tag} gesendet! (Simulation)`);
  };

  const handleFriendRequest = (requestId: string, action: 'accept' | 'decline') => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'accept') {
      const newFriend: Friend = {
        id: request.fromUser.id,
        name: request.fromUser.name,
        avatar: request.fromUser.avatar,
        status: 'offline',
        tag: request.fromUser.tag,
      };
      setFriends(prev => [...prev, newFriend]);
    }
    
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const sendMessage = (content: string, conversationId: string, senderId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      conversationId,
      content,
      timestamp: new Date(),
      read: true,
    };
    setMessages(prev => [...prev, newMessage]);
  };


  const value = {
    tasks, events, memories, files, friends, friendRequests, groups, messages,
    addTask, updateTask, deleteTask, toggleTask,
    addEvent, updateEvent, deleteEvent,
    addMemory, updateMemory, deleteMemory,
    addFile, deleteFile,
    addFriend, handleFriendRequest, sendMessage
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
