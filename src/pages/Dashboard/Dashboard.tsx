import React, { useState } from 'react';
import { CheckSquare, Calendar, MessageCircle, TrendingUp, MoreVertical, Edit, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Task, Event } from '../../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/common/Modal';
import TaskForm from '../Tasks/TaskForm';
import EventForm from '../Calendar/EventForm';
import Dropdown, { DropdownItem } from '../../components/common/Dropdown';

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
};

const Dashboard: React.FC = () => {
  const { tasks, events, friends, toggleTask, updateTask, addTask, addEvent, updateEvent } = useData();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const todayTasks = tasks.filter(task => !task.completed).slice(0, 5);
  const upcomingEvents = events.slice(0, 3);
  const onlineFriends = friends.filter(f => f.status === 'online');

  const handleOpenTaskModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'> & { id?: string }) => {
    if (taskData.id) {
      updateTask(taskData as Omit<Task, 'completed'>);
    } else {
      addTask(taskData);
    }
    handleCloseTaskModal();
  };

  const handleOpenEventModal = (event: Event | null = null) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'color'> & { id?: string }) => {
    if (eventData.id) {
      updateEvent(eventData as Omit<Event, 'color'>);
    } else {
      addEvent(eventData);
    }
    handleCloseEventModal();
  };

  const stats = [
    { label: 'Offene Aufgaben', value: tasks.filter(t => !t.completed).length, icon: CheckSquare, color: 'bg-blue-500' },
    { label: 'Termine heute', value: events.filter(e => isToday(e.date)).length, icon: Calendar, color: 'bg-green-500' },
    { label: 'Freunde online', value: onlineFriends.length, icon: MessageCircle, color: 'bg-purple-500' },
    { label: 'Produktivität', value: '0%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hier ist deine Übersicht für heute, {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <CheckSquare className="mr-2 text-primary-500" size={24} />
              Heutige Aufgaben
            </h2>
            <button onClick={() => handleOpenTaskModal()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500" title="Neue Aufgabe hinzufügen">
              <Plus size={22} />
            </button>
          </div>
          <div className="space-y-3">
            {todayTasks.length > 0 ? todayTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{task.category}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </div>
                <Dropdown trigger={<button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><MoreVertical size={18} /></button>}>
                  <DropdownItem onClick={() => handleOpenTaskModal(task)}>
                    <Edit size={16} className="mr-2" /> Bearbeiten
                  </DropdownItem>
                </Dropdown>
              </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">Keine Aufgaben für heute.</p>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Calendar className="mr-2 text-primary-500" size={24} />
              Anstehende Termine
            </h2>
            <button onClick={() => handleOpenEventModal()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-500" title="Neuen Termin hinzufügen">
              <Plus size={22} />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex-shrink-0 w-12 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{format(event.date, 'd', { locale: de })}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{format(event.date, 'MMM', { locale: de })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.startTime} - {event.endTime}</p>
                </div>
              </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">Keine anstehenden Termine.</p>}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <MessageCircle className="mr-2 text-primary-500" size={24} />
          Online Freunde
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {onlineFriends.length > 0 ? onlineFriends.map((friend) => (
            <div key={friend.id} className="flex flex-col items-center space-y-2">
              <div className="relative">
                <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-full" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white text-center truncate w-full">{friend.name}</p>
            </div>
          )) : <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-4">Keine Freunde online.</p>}
        </div>
      </motion.div>

      <Modal isOpen={isTaskModalOpen} onClose={handleCloseTaskModal} title={editingTask ? "Aufgabe bearbeiten" : "Neue Aufgabe erstellen"}>
        <TaskForm onSave={handleSaveTask} onCancel={handleCloseTaskModal} taskToEdit={editingTask} />
      </Modal>

      <Modal isOpen={isEventModalOpen} onClose={handleCloseEventModal} title={editingEvent ? "Termin bearbeiten" : "Neuen Termin erstellen"}>
        <EventForm onSave={handleSaveEvent} onCancel={handleCloseEventModal} eventToEdit={editingEvent} selectedDate={new Date()} />
      </Modal>
    </div>
  );
};

export default Dashboard;
