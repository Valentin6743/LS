import { supabase } from './supabase';
import type { Habit, HabitLog } from '../types';

export const habitService = {
  async getHabits() {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getHabitById(id: string) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('habits')
      .insert([habit])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateHabit(id: string, updates: Partial<Habit>) {
    const { data, error } = await supabase
      .from('habits')
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

  async deleteHabit(id: string) {
    const { error } = await supabase
      .from('habits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async logHabit(habitId: string, logDate: string, value: number = 1, notes?: string) {
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert(
        { habit_id: habitId, log_date: logDate, value, notes },
        { onConflict: 'habit_id,log_date' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getHabitLogs(habitId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId);

    if (startDate) {
      query = query.gte('log_date', startDate);
    }

    if (endDate) {
      query = query.lte('log_date', endDate);
    }

    const { data, error } = await query.order('log_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getHabitLogByDate(habitId: string, logDate: string) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', logDate)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
