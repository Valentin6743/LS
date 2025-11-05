import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { FriendRequest } from '../../types';

interface NotificationsDropdownProps {
  requests: FriendRequest[];
  onAction: (requestId: string, action: 'accept' | 'decline') => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ requests, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requests.length > 0) {
      setHasUnseen(true);
    }
  }, [requests.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnseen(false);
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative"
      >
        <Bell size={20} />
        {hasUnseen && requests.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 font-bold border-b border-gray-200 dark:border-gray-700">
              Benachrichtigungen
            </div>
            <div className="py-1 max-h-96 overflow-y-auto">
              {requests.length > 0 ? requests.map(req => (
                <div key={req.id} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <img src={req.fromUser.avatar} alt={req.fromUser.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-bold">{req.fromUser.name}</span> hat dir eine Freundschaftsanfrage gesendet.
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button onClick={() => onAction(req.id, 'accept')} className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs flex items-center justify-center gap-1">
                          <Check size={14} /> Annehmen
                        </button>
                        <button onClick={() => onAction(req.id, 'decline')} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-3 py-1 rounded-md text-xs flex items-center justify-center gap-1">
                          <X size={14} /> Ablehnen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
                  Keine neuen Benachrichtigungen.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsDropdown;
