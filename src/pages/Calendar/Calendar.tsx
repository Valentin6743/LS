import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckSquare, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Event } from '../../types';
import Modal from '../../components/common/Modal';
import EventForm from './EventForm';
import { useData } from '../../contexts/DataContext';

const Calendar: React.FC = () => {
  const { events, tasks, addEvent, updateEvent, deleteEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [calendarView, setCalendarView] = useState<'all' | 'private' | 'friends'>('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 });

  const filteredEvents = events.filter(event => 
    calendarView === 'all' || event.calendarType === calendarView
  );

  const eventsOnSelectedDate = filteredEvents.filter(event => isSameDay(event.date, selectedDate));
  const tasksOnSelectedDate = tasks.filter(task => task.dueDate && isSameDay(task.dueDate, selectedDate));

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleOpenModal = (event: Event | null = null) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'color'> & { id?: string }) => {
    if (eventData.id) {
      updateEvent(eventData as Omit<Event, 'color'>);
    } else {
      addEvent(eventData);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kalender</h1>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus size={20} />
          <span>Neuer Termin</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1" />
        <div className="flex gap-2">
          {['all', 'private', 'friends'].map(view => (
            <button
              key={view}
              onClick={() => setCalendarView(view as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                calendarView === view
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {view === 'all' ? 'Alle' : view === 'private' ? 'Privat' : 'Freunde'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{format(currentDate, 'MMMM yyyy', { locale: de })}</h2>
            <div className="flex space-x-2">
              <button onClick={previousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><ChevronRight size={20} className="text-gray-600 dark:text-gray-400" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, index) => <div key={`empty-${index}`} />)}
            {daysInMonth.map((day, index) => {
              const hasEvents = filteredEvents.some(event => isSameDay(event.date, day));
              const hasTasks = tasks.some(task => task.dueDate && isSameDay(task.dueDate, day));
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              return (
                <motion.button
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg transition-colors relative flex flex-col items-center justify-center ${isSelected ? 'bg-primary-500 text-white' : isTodayDate ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}`}
                >
                  <span className="text-sm font-medium">{format(day, 'd')}</span>
                  <div className="flex space-x-1 mt-1">
                    {hasEvents && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
                    {hasTasks && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{format(selectedDate, 'EEEE, d. MMMM', { locale: de })}</h3>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><CalendarIcon size={18} className="mr-2 text-primary-500" />Termine</h4>
            {eventsOnSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {eventsOnSelectedDate.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700/50" style={{ borderColor: event.color }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.startTime} - {event.endTime}</p>
                      </div>
                      <div className="flex items-center">
                        <button onClick={() => handleOpenModal(event)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={14} /></button>
                        <button onClick={() => deleteEvent(event.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 dark:text-gray-400 text-sm">Keine Termine.</p>}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><CheckSquare size={18} className="mr-2 text-primary-500" />Aufgaben</h4>
            {tasksOnSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {tasksOnSelectedDate.map((task) => (
                  <div key={task.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 dark:text-gray-400 text-sm">Keine Aufgaben fällig.</p>}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}>
        <EventForm onSave={handleSaveEvent} onCancel={handleCloseModal} eventToEdit={editingEvent} selectedDate={selectedDate} />
      </Modal>
    </div>
  );
};

export default Calendar;
