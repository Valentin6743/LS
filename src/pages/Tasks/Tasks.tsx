import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Task } from '../../types';
import Modal from '../../components/common/Modal';
import TaskForm from './TaskForm';
import Dropdown, { DropdownItem } from '../../components/common/Dropdown';
import { useData } from '../../contexts/DataContext';

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useData();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? !task.completed :
      task.completed;
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0));

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'> & { id?: string }) => {
    if (taskData.id) {
      updateTask(taskData as Omit<Task, 'completed'>);
    } else {
      addTask(taskData);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aufgaben</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Neue Aufgabe</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Aufgaben durchsuchen..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : 'Erledigt'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length > 0 ? filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${task.completed ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start space-x-4">
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 mt-1">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                }`}>
                  {task.completed && <motion.div initial={{scale: 0}} animate={{scale: 1}}><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></motion.div>}
                </div>
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-medium mb-1 ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{task.title}</h3>
                {task.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  {task.category && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{task.category}</span>}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>{task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}</span>
                  {task.dueDate && <span className="text-xs text-gray-500 dark:text-gray-400">Fällig: {task.dueDate.toLocaleDateString('de-DE')}</span>}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Dropdown trigger={<button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={20} /></button>}>
                  <DropdownItem onClick={() => handleOpenModal(task)}>
                    <Edit size={16} className="mr-2" /> Bearbeiten
                  </DropdownItem>
                  <DropdownItem onClick={() => deleteTask(task.id)} className="text-red-600 dark:text-red-400">
                    <Trash2 size={16} className="mr-2" /> Löschen
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <CheckSquare size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Keine Aufgaben gefunden</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Erstelle deine erste Aufgabe, um loszulegen!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}>
        <TaskForm onSave={handleSaveTask} onCancel={handleCloseModal} taskToEdit={editingTask} />
      </Modal>
    </div>
  );
};

export default Tasks;
