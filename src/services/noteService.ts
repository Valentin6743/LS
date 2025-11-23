import { supabase } from './supabase';
import type { Note } from '../types';

export const noteService = {
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getNoteById(id: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNote(id: string, updates: Partial<Note>) {
    const { data, error } = await supabase
      .from('notes')
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

  async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getNotesByCategory(category: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('category', category)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getFavoriteNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_favorite', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async searchNotes(query: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
