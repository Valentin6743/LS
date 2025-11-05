import React, { useState, useEffect } from 'react';
import { Event } from '../../types';

interface EventFormProps {
  onSave: (event: Omit<Event, 'id' | 'color'> & { id?: string }) => void;
  onCancel: () => void;
  eventToEdit?: Event | null;
  selectedDate: Date;
}

const EventForm: React.FC<EventFormProps> = ({ onSave, onCancel, eventToEdit, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [calendarType, setCalendarType] = useState<'private' | 'friends'>('private');
  const [participants, setParticipants] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date.toISOString().split('T')[0]);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setCalendarType(eventToEdit.calendarType);
      setParticipants(eventToEdit.participants?.join(', ') || '');
    } else {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  }, [eventToEdit, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(date);
    onSave({
      id: eventToEdit?.id,
      title,
      date: dateObj,
      startTime,
      endTime,
      calendarType,
      participants: participants.split(',').map(p => p.trim()).filter(Boolean),
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
          placeholder="z.B. Team-Meeting"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ende</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kalender</label>
        <select
          value={calendarType}
          onChange={(e) => setCalendarType(e.target.value as 'private' | 'friends')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="private">Privat</option>
          <option value="friends">Freunde</option>
        </select>
      </div>

      {calendarType === 'friends' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Freunde einladen</label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Namen oder E-Mails, mit Komma getrennt"
          />
        </div>
      )}

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

export default EventForm;
