import { supabase } from './supabase';
import type { CalendarEvent } from '../types';

export const eventService = {
  async getEvents(startDate?: string, endDate?: string) {
    let query = supabase
      .from('events')
      .select('*')
      .is('deleted_at', null);

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(id: string, updates: Partial<CalendarEvent>) {
    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getEventsBySource(sourceType: string, sourceId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  },

  async getEventsByTeam(teamId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('team_id', teamId)
      .is('deleted_at', null)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },
};
