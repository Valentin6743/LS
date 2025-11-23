import { supabase } from './supabase';
import type { Message } from '../types';

export const messageService = {
  async getConversation(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(senderId: string, recipientId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, recipient_id: recipientId, content }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUnreadMessages(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('recipient_id', userId)
      .is('read_at', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  },

  async markConversationAsRead(userId: string, otherUserId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .eq('sender_id', otherUserId)
      .is('read_at', null);

    if (error) throw error;
  },

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  },

  async getRecentConversations(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversations = new Map<string, Message>();

    data?.forEach((message) => {
      const otherId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, message);
      }
    });

    return Array.from(conversations.values());
  },
};
