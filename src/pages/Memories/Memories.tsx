import React, { useState, useMemo } from 'react';
import { Plus, Search, BookOpen, Camera, Smile, Meh, Frown, Sparkles, CloudRain, Edit, Trash2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, Mood } from '../../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Modal from '../../components/common/Modal';
import MemoryForm from './MemoryForm';
import Dropdown, { DropdownItem } from '../../components/common/Dropdown';
import { useData } from '../../contexts/DataContext';

const moodOptions: { mood: Mood; icon: React.ReactNode; label: string }[] = [
  { mood: 'happy', icon: <Smile className="text-yellow-500" />, label: 'Fröhlich' },
  { mood: 'excited', icon: <Sparkles className="text-purple-500" />, label: 'Aufgeregt' },
  { mood: 'neutral', icon: <Meh className="text-gray-500" />, label: 'Neutral' },
  { mood: 'sad', icon: <Frown className="text-blue-500" />, label: 'Traurig' },
  { mood: 'stressed', icon: <CloudRain className="text-red-500" />, label: 'Gestresst' },
];

const getMoodIcon = (mood?: Mood) => {
  return moodOptions.find(m => m.mood === mood)?.icon;
};

const Memories: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [view, setView] = useState<'diary' | 'gallery'>('diary');
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null);

  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      const matchesSearch = searchTerm === '' || 
        memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMood = !moodFilter || memory.mood === moodFilter;
      return matchesSearch && matchesMood;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [memories, searchTerm, moodFilter]);
  
  const allPhotos = useMemo(() => {
    return memories.flatMap(m => (m.photos || []).map(photoUrl => ({
      id: `${m.id}-${photoUrl}`,
      url: photoUrl,
      date: m.date,
      mood: m.mood,
    }))).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [memories]);

  const handleOpenModal = (memory: Memory | null = null) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMemory(null);
  };

  const handleSaveMemory = (memoryData: Omit<Memory, 'id'> & { id?: string }) => {
    if (memoryData.id) {
      updateMemory(memoryData as Memory);
    } else {
      addMemory(memoryData);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tagebuch & Erinnerungen</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsSummaryModalOpen(true)} className="inline-flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
            <BrainCircuit size={20} />
            <span>KI-Analyse</span>
          </button>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={20} />
            <span>Neuer Eintrag</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Einträge durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center justify-between md:justify-start gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {moodOptions.map(({ mood, icon }) => (
              <button key={mood} onClick={() => setMoodFilter(moodFilter === mood ? null : mood)} className={`p-2 rounded-md transition-colors ${moodFilter === mood ? 'bg-white dark:bg-gray-900 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{icon}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button onClick={() => setView('diary')} className={`px-3 py-2 flex items-center gap-2 rounded-md transition-colors ${view === 'diary' ? 'bg-white dark:bg-gray-900 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><BookOpen size={16} /> <span className="hidden sm:inline">Tagebuch</span></button>
            <button onClick={() => setView('gallery')} className={`px-3 py-2 flex items-center gap-2 rounded-md transition-colors ${view === 'gallery' ? 'bg-white dark:bg-gray-900 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><Camera size={16} /> <span className="hidden sm:inline">Galerie</span></button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          {view === 'diary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.length > 0 ? filteredMemories.map((memory, index) => (
                <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                  {memory.photos && memory.photos[0] && <img src={memory.photos[0]} alt={memory.title} className="w-full h-40 object-cover rounded-t-xl" />}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{format(memory.date, 'd. MMMM yyyy', { locale: de })}</span>
                      <div className="flex items-center gap-4">
                        {getMoodIcon(memory.mood)}
                        <Dropdown trigger={<button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={20} /></button>}>
                          <DropdownItem onClick={() => handleOpenModal(memory)}><Edit size={16} className="mr-2" /> Bearbeiten</DropdownItem>
                          <DropdownItem onClick={() => deleteMemory(memory.id)} className="text-red-500"><Trash2 size={16} className="mr-2" /> Löschen</DropdownItem>
                        </Dropdown>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{memory.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">{memory.content}</p>
                    {memory.tags && memory.tags.length > 0 && <div className="flex flex-wrap gap-2">{memory.tags.map(tag => <span key={tag} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs">{tag}</span>)}</div>}
                  </div>
                </motion.div>
              )) : (
                <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <BookOpen size={48} className="mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Dein Tagebuch ist leer</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Erstelle deinen ersten Eintrag und halte deine Gedanken fest.</p>
                </div>
              )}
            </div>
          )}
          {view === 'gallery' && (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPhotos.length > 0 ? allPhotos.map((photo) => (
                <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm">
                  <img src={photo.url} alt="Erinnerung" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3 text-white">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(photo.mood)}
                      <span className="text-xs font-medium">{format(photo.date, 'd. MMM yyyy', { locale: de })}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <Camera size={48} className="mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Keine Fotos gefunden</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Füge Fotos zu deinen Tagebucheinträgen hinzu, um sie hier zu sehen.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMemory ? 'Eintrag bearbeiten' : 'Neuer Tagebucheintrag'}>
        <MemoryForm onSave={handleSaveMemory} onCancel={handleCloseModal} memoryToEdit={editingMemory} />
      </Modal>

      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="KI Wochenanalyse">
        <div className="text-center">
            <BrainCircuit size={48} className="mx-auto text-purple-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Feature in Entwicklung</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Die KI-gestützte Zusammenfassung deiner Einträge ist bald verfügbar. Verbinde ein Supabase-Projekt, um die Entwicklung zu beschleunigen!
            </p>
        </div>
      </Modal>
    </div>
  );
};

export default Memories;
