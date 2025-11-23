import { supabase } from './supabase';
import type { Notification } from '../types';

export const notificationService = {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUnreadNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .is('read_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message?: string,
    actorId?: string,
    relatedType?: string,
    relatedId?: string
  ) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, type, title, message, actor_id: actorId, related_type: relatedType, related_id: relatedId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) throw error;
  },

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getNotificationsByType(type: Notification['type']) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
