import { supabase } from './supabase';
import type { Transaction } from '../types';

export const transactionService = {
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTransactionById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
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

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getTransactionsByCategory(category: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('category', category)
      .is('deleted_at', null);

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTransactionsByType(type: 'income' | 'expense' | 'transfer', startDate?: string, endDate?: string) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('type', type)
      .is('deleted_at', null);

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getSummaryByCategory(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('category, type, amount')
      .is('deleted_at', null)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (error) throw error;

    const summary: Record<string, { income: number; expense: number }> = {};

    data?.forEach((transaction) => {
      if (!summary[transaction.category]) {
        summary[transaction.category] = { income: 0, expense: 0 };
      }

      if (transaction.type === 'income') {
        summary[transaction.category].income += transaction.amount;
      } else {
        summary[transaction.category].expense += transaction.amount;
      }
    });

    return summary;
  },
};
