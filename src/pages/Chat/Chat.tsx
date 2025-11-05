import React, { useState } from 'react';
import { MessageCircle, UserPlus, Users, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Conversation, Friend } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import AddFriendModal from './AddFriendModal';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { friends, groups, messages, addFriend, sendMessage } = useData();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');

  const handleSendMessage = (content: string) => {
    if (!user || !selectedConversation) return;

    const conversationId = selectedConversation.type === 'dm'
      ? selectedConversation.user.id
      : selectedConversation.channel.id;

    sendMessage(content, conversationId, user.id);
  };

  const handleAddFriend = (tag: string) => {
    addFriend(tag);
    setIsAddFriendModalOpen(false);
  };

  const FriendGrid: React.FC<{ friends: Friend[] }> = ({ friends }) => (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {friends.map(friend => (
        <motion.div 
          key={friend.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4 flex flex-col items-center justify-center text-center"
        >
          <div className="relative mb-2">
            <img src={friend.avatar} alt={friend.name} className="w-20 h-20 rounded-full" />
            <div className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white dark:border-gray-800 rounded-full ${
              friend.status === 'online' ? 'bg-green-500' : friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>
          <p className="font-bold text-gray-900 dark:text-white truncate w-full">{friend.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{friend.tag}</p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat & Freunde</h1>
        <button 
          onClick={() => setIsAddFriendModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={20} />
          <span>Freund hinzufügen</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-1 xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button onClick={() => setActiveTab('chats')} className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-md transition-colors ${activeTab === 'chats' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>
                <MessageSquare size={18} /> Chats
              </button>
              <button onClick={() => setActiveTab('friends')} className={`flex-1 flex justify-center items-center gap-2 p-2 rounded-md transition-colors ${activeTab === 'friends' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>
                <Users size={18} /> Freunde
              </button>
            </div>
          </div>
          {activeTab === 'chats' ? (
            <ChatSidebar
              friends={friends}
              groups={groups}
              messages={messages}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          ) : (
            <FriendGrid friends={friends} />
          )}
        </div>

        <div className="lg:col-span-2 xl:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <AnimatePresence>
            {selectedConversation ? (
              <ChatWindow
                key={selectedConversation.type === 'dm' ? selectedConversation.user.id : selectedConversation.channel.id}
                conversation={selectedConversation}
                messages={messages.filter(m => 
                  m.conversationId === (selectedConversation.type === 'dm' ? selectedConversation.user.id : selectedConversation.channel.id)
                )}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4">
                <MessageCircle size={48} className="mb-4" />
                <p className="text-lg font-medium text-center">Wähle eine Konversation aus</p>
                <p className="text-sm text-center">oder füge einen Freund hinzu, um einen neuen Chat zu starten.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AddFriendModal 
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAdd={handleAddFriend}
      />
    </div>
  );
};

export default Chat;
