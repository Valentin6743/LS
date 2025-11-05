import React, { useState, useMemo } from 'react';
import { Upload, File as FileIcon, FileText, Image, Archive, Download, Trash2, FolderOpen, Plus, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { File as FileType } from '../../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import FileUploadForm from './FileUploadForm';
import { useData } from '../../contexts/DataContext';

const Files: React.FC = () => {
  const { user } = useAuth();
  const { files, addFile, deleteFile } = useData();
  const [categories, setCategories] = useState<string[]>(['Privat', 'Arbeit', 'Projekte', 'Gemeinsam']);
  const [selectedCategory, setSelectedCategory] = useState<string>('Privat');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    return files.filter(file => file.category === selectedCategory);
  }, [files, selectedCategory]);

  const handleSaveFile = (fileData: Omit<FileType, 'id' | 'uploadDate' | 'uploader' | 'size' | 'type' | 'url'>) => {
    if (!user) return;
    addFile(fileData, user.name);
    setIsUploadModalOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" size={32} />;
    if (type.includes('image')) return <Image className="text-blue-500" size={32} />;
    if (type.includes('zip')) return <Archive className="text-yellow-500" size={32} />;
    return <FileIcon className="text-gray-500" size={32} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dateiablage</h1>
        <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
          <Upload size={20} />
          <span>Datei hochladen</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ordner</h2>
          <div className="space-y-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Folder size={20} />
                <span className="font-medium">{category}</span>
              </button>
            ))}
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Plus size={20} />
              <span className="font-medium">Neuer Ordner</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div 
            onClick={() => setIsUploadModalOpen(true)}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-gray-300 dark:border-gray-600 border-dashed mb-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <h3 className="text-md font-medium text-gray-900 dark:text-white">
              Dateien hierher ziehen oder klicken zum Hochladen
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Simulierter Upload für neue Dateien.
            </p>
          </div>

          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getFileIcon(file.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{file.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                        {file.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{file.description}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Von {file.uploader} am {format(file.uploadDate, 'd. MMM yyyy', { locale: de })}
                    </p>
                  </div>
                  <div className="flex items-center justify-end space-x-1 mt-3">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"><Download size={18} /></button>
                    <button onClick={() => deleteFile(file.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"><Trash2 size={18} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <FolderOpen size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Dieser Ordner ist leer</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Lade deine erste Datei hoch, um loszulegen.</p>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Neue Datei hochladen">
        <FileUploadForm onSave={handleSaveFile} onCancel={() => setIsUploadModalOpen(false)} categories={categories} />
      </Modal>
    </div>
  );
};

export default Files;
