"use client";

import { useState } from 'react';
import { FileUploader } from '@/components/storage/FileUploader';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { CustomButton } from '@/components/ui/custom-button';

interface UploadedFile {
  file: string;
  url: string;
  data?: {
    path?: string;
  };
}

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function SandboxPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [filesList, setFilesList] = useState<FileInfo[]>([]);
  const [message, setMessage] = useState<string>('');
  const { listFiles, deleteFile } = useSupabaseStorage('archivos');

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setMessage(`${files.length} archivo(s) subido(s) exitosamente`);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadFilesList = async () => {
    const files = await listFiles('sandbox');
    setFilesList(files);
    setMessage('Lista de archivos actualizada');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteFile = async (filePath: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      const success = await deleteFile(filePath);
      if (success) {
        setFilesList(prev => prev.filter(f => f.path !== filePath));
        setUploadedFiles(prev => prev.filter(f => !f.data?.path?.includes(filePath)));
        setMessage('Archivo eliminado exitosamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error al eliminar archivo');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#546b75]">
        SANDBOX - PRUEBA DE ARCHIVOS
      </h1>

      {/* Message Display */}
      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {/* File Uploader */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Subir Archivos</h2>
        <FileUploader
          bucketName="archivos"
          folder="sandbox"
          multiple={true}
          maxSize={10}
          acceptedTypes="image/*,.pdf,.doc,.docx"
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Files List */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Archivos en el Bucket</h2>
          <CustomButton onClick={loadFilesList} variant="outline">
            Actualizar Lista
          </CustomButton>
        </div>
        
        {filesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Tamaño</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filesList.map((file, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{file.name}</td>
                    <td className="px-4 py-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-2">{file.type}</td>
                    <td className="px-4 py-2">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <CustomButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFile(file.path)}
                      >
                        Eliminar
                      </CustomButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay archivos. Haz clic en &quot;Actualizar Lista&quot; para cargar.
          </p>
        )}
      </div>

      {/* Recently Uploaded */}
      {uploadedFiles.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Archivos Subidos en esta Sesión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium">{file.file}</h3>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Ver archivo →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 