import { supabase } from './supabase';
import type { Friend } from '../types';

export const friendService = {
  async getFriends(status: 'accepted' | 'pending' = 'accepted') {
    const { data, error } = await supabase
      .from('friends')
      .select('*, friend:friend_id(id, email, full_name, avatar_url)')
      .eq('status', status);

    if (error) throw error;
    return data;
  },

  async getPendingRequests() {
    const { data, error } = await supabase
      .from('friends')
      .select('*, friend:user_id(id, email, full_name, avatar_url)')
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  async sendFriendRequest(userId: string, friendId: string) {
    const { data, error } = await supabase
      .from('friends')
      .insert([{ user_id: userId, friend_id: friendId, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async acceptFriendRequest(id: string) {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectFriendRequest(id: string) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async blockFriend(id: string) {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'blocked', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unblockFriend(id: string) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', id)
      .eq('status', 'blocked');

    if (error) throw error;
  },

  async removeFriend(userId: string, friendId: string) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (error) throw error;
  },

  async isFriend(userId: string, friendId: string) {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .eq('status', 'accepted')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
