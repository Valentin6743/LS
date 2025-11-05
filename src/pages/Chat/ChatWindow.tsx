import React, { useState } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Smile, Send, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { Conversation, Message as MessageType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatWindowProps {
  conversation: Conversation;
  messages: MessageType[];
  onSendMessage: (content: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, onSendMessage }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const conversationName = conversation.type === 'dm' ? conversation.user.name : conversation.channel.name;
  const conversationSubtext = conversation.type === 'dm' ? conversation.user.status : conversation.group.name;
  const conversationAvatar = conversation.type === 'dm' 
    ? <img src={conversation.user.avatar} alt={conversation.user.name} className="w-10 h-10 rounded-full" />
    : <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><Hash size={20} className="text-gray-600 dark:text-gray-400" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          {conversationAvatar}
          <div>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{conversationName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{conversationSubtext}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Phone size={20} className="text-gray-600 dark:text-gray-400" /></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Video size={20} className="text-gray-600 dark:text-gray-400" /></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><MoreVertical size={20} className="text-gray-600 dark:text-gray-400" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          const senderAvatar = conversation.type === 'dm' 
            ? (isOwn ? user?.avatar : conversation.user.avatar)
            : user?.avatar; // In a real group chat, you'd fetch the sender's avatar
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwn && <img src={senderAvatar} alt="sender" className="w-6 h-6 rounded-full self-start" />}
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                isOwn ? 'bg-primary-500 text-white rounded-br-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-lg'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                  {format(msg.timestamp, 'HH:mm', { locale: de })}
                </p>
              </div>
               {isOwn && <img src={senderAvatar} alt="sender" className="w-6 h-6 rounded-full self-start" />}
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-2">
          <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500"><Smile size={20} /></button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            className="flex-1 px-2 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-white"
          />
          <button type="button" className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500"><Paperclip size={20} /></button>
          <button type="submit" className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50" disabled={!message}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
