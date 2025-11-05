import React, { useState, useEffect } from 'react';
import { Memory, Mood } from '../../types';
import { Smile, Meh, Frown, Sparkles, CloudRain } from 'lucide-react';

interface MemoryFormProps {
  onSave: (memory: Omit<Memory, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  memoryToEdit?: Memory | null;
}

const moodOptions: { mood: Mood; icon: React.ReactNode; label: string }[] = [
  { mood: 'happy', icon: <Smile className="w-8 h-8 text-yellow-500" />, label: 'Fröhlich' },
  { mood: 'excited', icon: <Sparkles className="w-8 h-8 text-purple-500" />, label: 'Aufgeregt' },
  { mood: 'neutral', icon: <Meh className="w-8 h-8 text-gray-500" />, label: 'Neutral' },
  { mood: 'sad', icon: <Frown className="w-8 h-8 text-blue-500" />, label: 'Traurig' },
  { mood: 'stressed', icon: <CloudRain className="w-8 h-8 text-red-500" />, label: 'Gestresst' },
];

const MemoryForm: React.FC<MemoryFormProps> = ({ onSave, onCancel, memoryToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [photos, setPhotos] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (memoryToEdit) {
      setTitle(memoryToEdit.title);
      setContent(memoryToEdit.content);
      setDate(memoryToEdit.date.toISOString().split('T')[0]);
      setMood(memoryToEdit.mood);
      setPhotos(memoryToEdit.photos?.join(', ') || '');
      setTags(memoryToEdit.tags?.join(', ') || '');
    }
  }, [memoryToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: memoryToEdit?.id,
      title,
      content,
      date: new Date(date),
      mood,
      photos: photos.split(',').map(p => p.trim()).filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Ein unvergesslicher Tag"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eintrag</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Was ist heute passiert?"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stimmung</label>
        <div className="flex justify-around items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {moodOptions.map(opt => (
            <button
              key={opt.mood}
              type="button"
              onClick={() => setMood(opt.mood)}
              className={`p-3 rounded-full transition-all duration-200 ${mood === opt.mood ? 'bg-primary-100 dark:bg-primary-500/30 scale-110' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fotos (URLs)</label>
        <input
          type="text"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Bild-URLs, mit Komma getrennt"
        />
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Da kein Backend verbunden ist, füge bitte direkte Bild-URLs hinzu (z.B. von placehold.co).
        </p>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Urlaub, Familie, Projekt (mit Komma getrennt)"
        />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
          Abbrechen
        </button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600">
          Speichern
        </button>
      </div>
    </form>
  );
};

export default MemoryForm;
