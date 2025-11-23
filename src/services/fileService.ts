import { supabase } from './supabase';
import type { FileRecord } from '../types';

export const fileService = {
  async uploadFile(
    file: File,
    path: string,
    metadata: Omit<FileRecord, 'id' | 'created_at' | 'storage_path'>
  ) {
    const fileName = `${Date.now()}-${file.name}`;
    const storagePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(storagePath, file);

    if (uploadError) throw uploadError;

    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert([{ ...metadata, storage_path: storagePath }])
      .select()
      .single();

    if (dbError) throw dbError;
    return fileData;
  },

  async getFilesByNote(noteId: string) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('note_id', noteId)
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  },

  async getFilesByRelated(relatedType: string, relatedId: string) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('related_type', relatedType)
      .eq('related_id', relatedId)
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  },

  async deleteFile(id: string, storagePath: string) {
    const { error: deleteError } = await supabase.storage
      .from('files')
      .remove([storagePath]);

    if (deleteError) throw deleteError;

    const { error: dbError } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (dbError) throw dbError;
  },

  async getFileUrl(storagePath: string) {
    const { data } = supabase.storage
      .from('files')
      .getPublicUrl(storagePath);

    return data?.publicUrl;
  },

  async getUserFiles() {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
