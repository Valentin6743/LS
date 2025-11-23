import { supabase } from './supabase';
import type { Team, TeamMember } from '../types';

export const teamService = {
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTeamById(id: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeam(id: string, updates: Partial<Team>) {
    const { data, error } = await supabase
      .from('teams')
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

  async deleteTeam(id: string) {
    const { error } = await supabase
      .from('teams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, users:user_id(id, email, full_name, avatar_url)')
      .eq('team_id', teamId);

    if (error) throw error;
    return data;
  },

  async addTeamMember(teamId: string, userId: string, role: 'admin' | 'member' = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{ team_id: teamId, user_id: userId, role }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeTeamMember(teamId: string, userId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getUserTeams(userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('teams:team_id(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map((tm: any) => tm.teams) || [];
  },
};
