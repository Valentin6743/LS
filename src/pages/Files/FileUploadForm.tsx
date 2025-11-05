import React, { useState } from 'react';
import { File as FileType } from '../../types';

interface FileUploadFormProps {
  onSave: (file: Omit<FileType, 'id' | 'uploadDate' | 'uploader' | 'size' | 'type' | 'url'>) => void;
  onCancel: () => void;
  categories: string[];
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ onSave, onCancel, categories }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    onSave({
      name,
      description,
      category,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dateiname</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="z.B. Projekt-Präsentation.pdf"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Simulierte Eingabe, da kein echter Dateiupload erfolgt.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beschreibung (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Kurze Beschreibung des Inhalts"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordner / Kategorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
          Abbrechen
        </button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600">
          Hochladen
        </button>
      </div>
    </form>
  );
};

export default FileUploadForm;
