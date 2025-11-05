import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, colorPalettes, backgroundPatterns } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { User, Palette, Save, Check, Image as ImageIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { primaryColor, setPrimaryColor, background, setBackground, isDark } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [feedback, setFeedback] = useState('');

  const handleAvatarSave = () => {
    if (user) {
      updateUser({ avatar: avatarUrl });
      setFeedback('Avatar erfolgreich aktualisiert!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleColorSelect = (colorName: string) => {
    setPrimaryColor(colorName);
    setFeedback('Design-Farbe geändert!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleBackgroundSelect = (bgName: string) => {
    setBackground(bgName);
    setFeedback('Hintergrund geändert!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const backgroundOptions = [
    { name: 'default', label: 'Standard' },
    { name: 'dots', label: 'Punkte' },
    { name: 'lines', label: 'Linien' },
    { name: 'gradient', label: 'Verlauf' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Passe dein LifeSync-Erlebnis an.
        </p>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg"
          role="alert"
        >
          <p className="font-bold">{feedback}</p>
        </motion.div>
      )}

      {/* Profile Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <User size={22} /> Profil
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img src={avatarUrl || user?.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://beispiel.com/bild.png"
              />
              <button onClick={handleAvatarSave} className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
                <Save size={18} />
                <span className="hidden sm:inline">Speichern</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Design Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Palette size={22} /> Design
        </h2>
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primärfarbe</label>
                <div className="flex flex-wrap gap-3">
                    {Object.keys(colorPalettes).map(colorName => (
                    <button
                        key={colorName}
                        onClick={() => handleColorSelect(colorName)}
                        className={`w-10 h-10 rounded-full transition-all duration-200 border-4 flex items-center justify-center ${primaryColor === colorName ? 'border-primary-500 scale-110' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: `rgb(${colorPalettes[colorName][500]})` }}
                        title={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                    >
                        {primaryColor === colorName && <Check size={20} className="text-white" />}
                    </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Hintergrund</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {backgroundOptions.map(opt => {
                        const isSelected = background === opt.name;
                        const bgClass = `bg-pattern-${opt.name}-${isDark ? 'dark' : 'light'}`;
                        const defaultBgClass = 'bg-pattern-default';
                        return (
                            <button
                                key={opt.name}
                                onClick={() => handleBackgroundSelect(opt.name)}
                                className={`h-24 rounded-lg border-2 transition-all duration-200 relative overflow-hidden ${isSelected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}
                            >
                                <div className={`absolute inset-0 ${opt.name === 'default' ? defaultBgClass : bgClass}`} />
                                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white">
                                    {isSelected && <Check size={24} className="absolute top-2 right-2 p-1 bg-primary-500 rounded-full" />}
                                    <p className="font-bold">{opt.label}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
