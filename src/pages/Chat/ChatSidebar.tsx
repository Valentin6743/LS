import React, { useState } from 'react';
import { Search, Hash, MessageCircle } from 'lucide-react';
import { Friend, Group, Conversation, Message } from '../../types';

interface ChatSidebarProps {
  friends: Friend[];
  groups: Group[];
  messages: Message[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ friends, groups, messages, selectedConversation, onSelectConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getLastMessage = (conversationId: string) => {
    const lastMsg = messages.filter(m => m.conversationId === conversationId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    return lastMsg ? lastMsg.content : 'Noch keine Nachrichten';
  };

  const getUnreadCount = (conversationId: string) => {
    return messages.filter(m => m.conversationId === conversationId && !m.read).length;
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Freunde</h3>
          {filteredFriends.length > 0 ? filteredFriends.map((friend) => {
            const isSelected = selectedConversation?.type === 'dm' && selectedConversation.user.id === friend.id;
            const unreadCount = getUnreadCount(friend.id);
            return (
              <button
                key={friend.id}
                onClick={() => onSelectConversation({ type: 'dm', user: friend })}
                className={`w-full p-2 flex items-center space-x-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                  isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${
                    friend.status === 'online' ? 'bg-green-500' : friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isSelected ? 'text-primary-600 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>{friend.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{getLastMessage(friend.id)}</p>
                </div>
                {unreadCount > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </div>
                )}
              </button>
            )
          }) : (
             <p className="text-sm text-gray-500 dark:text-gray-400 px-2">Keine Freunde gefunden.</p>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Gruppen</h3>
          {groups.map(group => (
            <div key={group.id} className="mb-2">
              <div className="flex items-center space-x-2 px-2 py-1">
                <span className="text-lg">{group.icon}</span>
                <p className="font-bold text-gray-800 dark:text-gray-200">{group.name}</p>
              </div>
              <div className="pl-4">
                {group.channels.map(channel => {
                  const isSelected = selectedConversation?.type === 'channel' && selectedConversation.channel.id === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => onSelectConversation({ type: 'channel', group, channel })}
                      className={`w-full flex items-center space-x-2 text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                      }`}
                    >
                      <Hash size={16} className={isSelected ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500'} />
                      <span className={`font-medium capitalize ${isSelected ? 'text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>{channel.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
