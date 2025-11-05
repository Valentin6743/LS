import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface TaskFormProps {
  onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string }) => void;
  onCancel: () => void;
  taskToEdit?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSave, onCancel, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || '');
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.toISOString().split('T')[0] : '');
      setPriority(taskToEdit.priority);
      setRepeat(taskToEdit.repeat);
    }
  }, [taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: taskToEdit?.id,
      title,
      description,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      repeat,
    });
  };

  const priorityOptions: { value: Task['priority']; label: string }[] = [
    { value: 'low', label: 'Niedrig' },
    { value: 'medium', label: 'Mittel' },
    { value: 'high', label: 'Hoch' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="z.B. Wöchentlicher Bericht"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beschreibung</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Füge weitere Details hinzu..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorie</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="z.B. Arbeit, Privat"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fälligkeitsdatum</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorität</label>
        <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
          {priorityOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                priority === opt.value ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wiederholen</label>
        <button
          type="button"
          onClick={() => setRepeat(!repeat)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
        >
          {repeat ? <ToggleRight size={24} className="text-primary-500" /> : <ToggleLeft size={24} />}
          <span>{repeat ? 'Aktiviert' : 'Deaktiviert'}</span>
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Wenn aktiviert, wird diese Aufgabe nach Erledigung für den nächsten Tag neu erstellt.
        </p>
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

export default TaskForm;
