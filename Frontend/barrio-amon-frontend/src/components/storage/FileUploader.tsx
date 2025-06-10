"use client";

import { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { CustomButton } from '@/components/ui/custom-button';

interface FileUploaderProps {
  bucketName?: string;
  folder?: string;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUploadComplete?: (files: any[]) => void;
  className?: string;
}

interface UploadedFile {
  file: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export const FileUploader = ({
  bucketName = 'archivos',
  folder,
  acceptedTypes = '*/*',
  maxSize = 50,
  multiple = false,
  onUploadComplete,
  className = ''
}: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, uploading, progress } = useSupabaseStorage(bucketName);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setError('');
    const validFiles = files.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`El archivo ${file.name} excede el límite de ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (multiple) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setError('');
    const results: UploadedFile[] = [];
    
    for (const file of selectedFiles) {
      const result = await uploadFile(file, folder);
      if (result.success) {
        results.push({
          file: file.name,
          url: result.url || '',
          data: result.data
        });
      } else {
        setError(result.error || 'Error al subir archivo');
      }
    }

    setUploadedFiles(prev => [...prev, ...results]);
    setSelectedFiles([]);
    
    if (onUploadComplete && results.length > 0) {
      onUploadComplete(results);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else if (['pdf'].includes(ext || '')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-gray-500">
          Máximo {maxSize}MB por archivo
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Archivos seleccionados:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <CustomButton
              variant="outline"
              onClick={() => setSelectedFiles([])}
              disabled={uploading}
            >
              Limpiar
            </CustomButton>
            <CustomButton
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? `Subiendo... ${progress}%` : 'Subir Archivos'}
            </CustomButton>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">Archivos subidos:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.file}</p>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Ver archivo
                    </a>
                  </div>
                </div>
                <div className="text-green-600">
                  ✓ Subido
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 