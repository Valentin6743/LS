import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import NotificationsDropdown from '../common/NotificationsDropdown';
import { useData } from '../../contexts/DataContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { friendRequests, handleFriendRequest } = useData();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <Menu size={24} />
        </button>

        <div className="flex-1 lg:hidden" />

        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          
          <NotificationsDropdown 
            requests={friendRequests}
            onAction={handleFriendRequest}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
