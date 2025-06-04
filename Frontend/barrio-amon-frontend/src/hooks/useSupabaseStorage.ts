"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FileUploadResult {
  success: boolean;
  data?: any;
  error?: string;
  url?: string;
}

interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url?: string;
  uploadedAt: string;
}

export const useSupabaseStorage = (bucketName: string = 'archivos') => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  const uploadFile = async (
    file: File,
    folder?: string,
    options?: {
      upsert?: boolean;
      cacheControl?: string;
    }
  ): Promise<FileUploadResult> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validaciones
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('El archivo excede el límite de 50MB');
      }

      // Generar path único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      setProgress(25);

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false
        });

      if (error) throw error;

      setProgress(75);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setProgress(100);

      const result = {
        success: true,
        data,
        url: urlData.publicUrl
      };

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      return false;
    }
  };

  const getSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error al obtener URL:', error);
      return null;
    }
  };

  const listFiles = async (folder?: string): Promise<FileRecord[]> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder || '', {
          limit: 100,
          offset: 0
        });

      if (error) throw error;

      return data.map(file => ({
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'unknown',
        path: folder ? `${folder}/${file.name}` : file.name,
        uploadedAt: file.created_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error al listar archivos:', error);
      return [];
    }
  };

  return {
    uploadFile,
    deleteFile,
    getSignedUrl,
    listFiles,
    uploading,
    progress
  };
}; 