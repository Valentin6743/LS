import React, { useState } from 'react';
import Modal from '../../components/common/Modal';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tag: string) => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [tag, setTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag.trim()) {
      onAdd(tag.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Freund hinzufügen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Benutzer-Tag
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Nutzername#1234"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gib den vollständigen Tag deines Freundes ein (Groß- und Kleinschreibung beachten).
          </p>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
            Abbrechen
          </button>
          <button type="submit" className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600">
            Anfrage senden
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFriendModal;
