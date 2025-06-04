"use client";
import { useState, useEffect } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { FileUploader } from "@/components/storage/FileUploader";
import Select from 'react-select';

interface Objetivo {
  id: string;
  nombre: string;
}

interface Meta {
  id: string;
  descripcion: string;
  objetivos: string[];
  responsable: string;
  responsable_id?: number;
  fecha_fin: string;
  estado: string;
  actividades?: Activity[];
  cancelReason?: string;
  indicadores?: Indicator[];
}

interface Activity {
  id: string;
  description: string;
  isCompleted: boolean;
  isCanceled: boolean;
  cancelReason?: string;
}

interface Indicator {
  type: 'link' | 'file';
  value: string;
}

interface Option {
  value: string;
  label: string;
}

interface Usuario {
  id: number;
  full_name: string;
}

// ============================================
// API FUNCTIONS
// ============================================

const API_BASE_URL = "http://localhost:3030/api";

// Función helper para llamadas API
const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en API call ${url}:`, error);
    throw error;
  }
};

// Función para computar el estado de una meta basado en sus actividades
const computarEstadoMeta = (actividades: Activity[] = []): string => {
  const actividadesValidas = actividades.filter(act => !act.isCanceled);
  const actividadesCompletadas = actividadesValidas.filter(act => act.isCompleted);
  
  if (actividadesValidas.length === 0) return 'Pendiente';
  if (actividadesCompletadas.length === actividadesValidas.length) return 'Completada';
  if (actividadesCompletadas.length > 0) return 'En progreso';
  return 'Pendiente';
};

// API Functions para Metas
const fetchMetas = async (): Promise<Meta[]> => {
  try {
    const data = await apiCall('/metas');
    return data.map((meta: any) => ({
      id: meta.id.toString(),
      descripcion: meta.descripcion,
      objetivos: meta.objetivos?.map((obj: any) => obj.objetivo.id.toString()) || [],
      responsable: meta.responsable?.full_name || 'Sin asignar',
      responsable_id: meta.responsable_id,
      fecha_fin: meta.fecha_fin,
      estado: computarEstadoMeta(meta.actividades),
      actividades: meta.actividades || [],
      indicadores: meta.indicadores?.map((ind: any) => ({
        type: ind.tipo,
        value: ind.valor
      })) || []
    }));
  } catch (error) {
    console.error('Error fetching metas:', error);
    return [];
  }
};

const createMeta = async (metaData: Omit<Meta, "id">): Promise<Meta | null> => {
  try {
    const payload = {
      descripcion: metaData.descripcion,
      responsable_id: metaData.responsable_id,
      fecha_fin: metaData.fecha_fin,
      objetivos: metaData.objetivos.map(id => parseInt(id)),
      actividades: metaData.actividades || [],
      indicadores: metaData.indicadores || []
    };

    const data = await apiCall('/metas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      id: data.id.toString(),
      descripcion: data.descripcion,
      objetivos: data.objetivos?.map((obj: any) => obj.objetivo.id.toString()) || [],
      responsable: data.responsable?.full_name || 'Sin asignar',
      responsable_id: data.responsable_id,
      fecha_fin: data.fecha_fin,
      estado: computarEstadoMeta(data.actividades),
      actividades: data.actividades || [],
      indicadores: data.indicadores?.map((ind: any) => ({
        type: ind.tipo,
        value: ind.valor
      })) || []
    };
  } catch (error) {
    console.error('Error creating meta:', error);
    return null;
  }
};

const updateMeta = async (id: string, metaData: Omit<Meta, "id">): Promise<Meta | null> => {
  try {
    const payload = {
      descripcion: metaData.descripcion,
      responsable_id: metaData.responsable_id,
      fecha_fin: metaData.fecha_fin,
      objetivos: metaData.objetivos.map(id => parseInt(id))
    };

    const data = await apiCall(`/metas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    return {
      id: data.id.toString(),
      descripcion: data.descripcion,
      objetivos: data.objetivos?.map((obj: any) => obj.objetivo.id.toString()) || [],
      responsable: data.responsable?.full_name || 'Sin asignar',
      responsable_id: data.responsable_id,
      fecha_fin: data.fecha_fin,
      estado: computarEstadoMeta(data.actividades),
      actividades: data.actividades || [],
      indicadores: data.indicadores?.map((ind: any) => ({
        type: ind.tipo,
        value: ind.valor
      })) || []
    };
  } catch (error) {
    console.error('Error updating meta:', error);
    return null;
  }
};

const deleteMeta = async (id: string): Promise<boolean> => {
  try {
    await apiCall(`/metas/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting meta:', error);
    return false;
  }
};

// API Functions para Actividades
const updateActividad = async (id: string, actividadData: Partial<Activity>): Promise<boolean> => {
  try {
    await apiCall(`/actividades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(actividadData)
    });
    return true;
  } catch (error) {
    console.error('Error updating actividad:', error);
    return false;
  }
};

const createActividad = async (metaId: string, description: string): Promise<Activity | null> => {
  try {
    const data = await apiCall(`/metas/${metaId}/actividades`, {
      method: 'POST',
      body: JSON.stringify({ description })
    });
    return data;
  } catch (error) {
    console.error('Error creating actividad:', error);
    return null;
  }
};

// API Functions para Indicadores
const createIndicador = async (metaId: string, tipo: string, valor: string): Promise<boolean> => {
  try {
    await apiCall(`/metas/${metaId}/indicadores`, {
      method: 'POST',
      body: JSON.stringify({ tipo, valor })
    });
    return true;
  } catch (error) {
    console.error('Error creating indicador:', error);
    return false;
  }
};

// API Functions para Objetivos y Usuarios
const fetchObjetivos = async (): Promise<Objetivo[]> => {
  try {
    const data = await apiCall('/objetivos');
    return data.map((obj: any) => ({
      id: obj.id.toString(),
      nombre: obj.nombre
    }));
  } catch (error) {
    console.error('Error fetching objetivos:', error);
    return [];
  }
};

const fetchUsuarios = async (): Promise<Usuario[]> => {
  try {
    const data = await apiCall('/usuarios');
    return data;
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return [];
  }
};

export default function PlanOperativoPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMeta, setEditMeta] = useState<Meta | null>(null);
  const [nuevaMeta, setNuevaMeta] = useState<Omit<Meta, "id">>({
    descripcion: "",
    objetivos: [],
    responsable: "",
    fecha_fin: "",
    estado: "Pendiente",
    actividades: [],
    indicadores: [],
  });
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newIndicatorLink, setNewIndicatorLink] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [metasData, objetivosData, usuariosData] = await Promise.all([
          fetchMetas(),
          fetchObjetivos(),
          fetchUsuarios()
        ]);
        
        setMetas(metasData);
        setObjetivos(objetivosData);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nuevaMeta.descripcion || nuevaMeta.objetivos.length === 0) return;
    
    setLoading(true);
    try {
      let result: Meta | null = null;
      
      if (editMeta) {
        result = await updateMeta(editMeta.id, nuevaMeta);
        if (result) {
          setMetas(metas.map(m => m.id === editMeta.id ? result! : m));
        }
      } else {
        result = await createMeta(nuevaMeta);
        if (result) {
          setMetas([...metas, result]);
        }
      }

      if (result) {
        setShowForm(false);
        setEditMeta(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving meta:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNuevaMeta({ 
      descripcion: "", 
      objetivos: [], 
      responsable: "", 
      fecha_fin: "", 
      estado: "Pendiente", 
      actividades: [], 
      indicadores: [] 
    });
    setNuevaActividad("");
    setNewIndicatorLink('');
    setUploadMessage('');
  };

  const handleEdit = (meta: Meta) => {
    setEditMeta(meta);
    setNuevaMeta({
      descripcion: meta.descripcion,
      objetivos: meta.objetivos,
      responsable: meta.responsable,
      responsable_id: meta.responsable_id,
      fecha_fin: meta.fecha_fin,
      estado: meta.estado,
      actividades: meta.actividades || [],
      indicadores: meta.indicadores || [],
    });
    setShowForm(true);
    setNewIndicatorLink('');
    setUploadMessage('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta meta?")) return;
    
    setLoading(true);
    const success = await deleteMeta(id);
    if (success) {
      setMetas(metas.filter(m => m.id !== id));
    }
    setLoading(false);
  };

  const handleActivityCompletionToggle = async (activityId: string) => {
    if (!editMeta) return;
    
    const activity = nuevaMeta.actividades?.find(act => act.id === activityId);
    if (!activity) return;

    const success = await updateActividad(activityId, {
      isCompleted: !activity.isCompleted,
      isCanceled: activity.isCompleted ? activity.isCanceled : false
    });

    if (success) {
      setNuevaMeta(prev => ({
        ...prev,
        actividades: (prev.actividades || []).map(act =>
          act.id === activityId ? { 
            ...act, 
            isCompleted: !act.isCompleted, 
            isCanceled: act.isCompleted ? act.isCanceled : false 
          } : act
        ),
      }));
      
      // Actualizar también en la lista principal
      const updatedMetas = await fetchMetas();
      setMetas(updatedMetas);
    }
  };

  const handleActivityCancellation = async (activityId: string) => {
    const success = await updateActividad(activityId, {
      isCanceled: true,
      isCompleted: false
    });

    if (success) {
      setNuevaMeta(prev => ({
        ...prev,
        actividades: (prev.actividades || []).map(act =>
          act.id === activityId ? { ...act, isCanceled: true, isCompleted: false } : act
        ),
      }));
      
      // Actualizar también en la lista principal
      const updatedMetas = await fetchMetas();
      setMetas(updatedMetas);
    }
  };

  const handleActivityReasonChange = async (activityId: string, reason: string) => {
    const success = await updateActividad(activityId, {
      cancelReason: reason
    });

    if (success) {
      setNuevaMeta(prev => ({
        ...prev,
        actividades: (prev.actividades || []).map(act =>
          act.id === activityId ? { ...act, cancelReason: reason } : act
        ),
      }));
    }
  };

  const handleAddIndicatorLink = async () => {
    if (newIndicatorLink.trim() && editMeta) {
      const success = await createIndicador(editMeta.id, 'link', newIndicatorLink.trim());
      if (success) {
        setNuevaMeta(prev => ({
          ...prev,
          indicadores: [...(prev.indicadores || []), { type: 'link', value: newIndicatorLink.trim() }]
        }));
        setNewIndicatorLink('');
        
        // Actualizar también en la lista principal
        const updatedMetas = await fetchMetas();
        setMetas(updatedMetas);
      }
    }
  };

  // Nueva función para manejar archivos subidos desde Supabase Storage
  const handleFileUploadComplete = async (uploadedFiles: any[]) => {
    if (!editMeta) {
      setUploadMessage('Error: No se puede subir archivos sin una meta seleccionada');
      return;
    }

    try {
      // Guardar cada archivo subido como indicador en la base de datos
      for (const file of uploadedFiles) {
        const success = await createIndicador(editMeta.id, 'file', file.url);
        if (success) {
          setNuevaMeta(prev => ({
            ...prev,
            indicadores: [...(prev.indicadores || []), { type: 'file', value: file.url }]
          }));
        }
      }
      
      setUploadMessage(`${uploadedFiles.length} archivo(s) subido(s) exitosamente`);
      setTimeout(() => setUploadMessage(''), 3000);
      
      // Actualizar también en la lista principal
      const updatedMetas = await fetchMetas();
      setMetas(updatedMetas);
    } catch (error) {
      console.error('Error saving file indicators:', error);
      setUploadMessage('Error al guardar los archivos en la base de datos');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const handleRemoveIndicator = (indexToRemove: number) => {
    setNuevaMeta(prev => ({
      ...prev,
      indicadores: (prev.indicadores || []).filter((_, index) => index !== indexToRemove)
    }));
  };

  const filteredMetas = metas.filter(meta => {
    // TODO: Implementar filtrado por año cuando se agregue el campo año a las metas
    return true;
  });

  if (loading && metas.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  console.log(metas);
  console.log(objetivos);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b70]">Plan Operativo Anual {selectedYear}</h1>

      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => {
          setShowForm(true);
          setEditMeta(null);
          resetForm();
        }}>Agregar Meta</CustomButton>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Metas del Plan Operativo</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-[#4A6670] text-white">
                <th className="border border-gray-300 py-2 px-4 text-left">Objetivos Asociados</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Meta (SMART)</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Actividades</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Responsable</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Fecha Límite</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Estado</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Indicadores</th>
                <th className="border border-gray-300 py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetas.map(meta => {
                const activities = meta.actividades || [];
                const status = computarEstadoMeta(activities);

                return (
                  <tr key={meta.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      {meta.objetivos.map(oid => (
                        <span key={oid} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1">
                          {objetivos.find(o => o.id === oid)?.nombre}
                        </span>
                      ))}
                    </td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{meta.descripcion}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      {activities.map((act, idx) => (
                        <div key={idx} className={`text-sm ${act.isCompleted && !act.isCanceled ? 'text-green-600' : act.isCanceled ? 'line-through text-red-500' : 'text-gray-900'}`}>
                          - {act.description}
                        </div>
                      ))}
                      {activities.length === 0 && '-N/A-'}
                    </td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{meta.responsable}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{meta.fecha_fin}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{status}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      {(meta.indicadores && meta.indicadores.length > 0) ? (
                        <ul className="list-disc list-inside">
                          {meta.indicadores.map((indicator, idx) => (
                            <li key={idx} className="text-sm">
                              {indicator.type === 'link' ? (
                                <a href={indicator.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{indicator.value}</a>
                              ) : (
                                <a
                                  href={indicator.value.startsWith('http') ? indicator.value : `/uploads/${indicator.value}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {indicator.value.startsWith('http') ? 'Ver archivo en la nube' : indicator.value}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'Sin evidencias'
                      )}
                    </td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      <CustomButton variant="outline" size="sm" onClick={() => handleEdit(meta)} className="mr-2">Editar</CustomButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editMeta ? "Editar Meta" : "Agregar Meta"}
            </h2>
            
            <div className="mb-4">
              <label className="block font-semibold mb-1">Objetivos Asociados</label>
              <Select<Option, true>
                isMulti
                options={objetivos.map(obj => ({ value: obj.id, label: obj.nombre }))}
                value={nuevaMeta.objetivos
                  .map(objId => {
                    const objetivo = objetivos.find(o => o.id === objId);
                    return objetivo ? { value: objetivo.id, label: objetivo.nombre } : null;
                  })
                  .filter((option): option is Option => option !== null)}
                onChange={(selectedOptions) => {
                  const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  setNuevaMeta({ ...nuevaMeta, objetivos: selectedIds });
                }}
                isClearable={true}
                isSearchable={true}
                placeholder="Seleccionar objetivos..."
                className="w-full"
                classNamePrefix="select"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-semibold mb-1">Meta (SMART)</label>
              <textarea
                className="w-full border rounded p-2"
                value={nuevaMeta.descripcion}
                onChange={e => setNuevaMeta({ ...nuevaMeta, descripcion: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-semibold mb-1">Actividades/Indicadores</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="border rounded p-2 flex-1"
                  placeholder="Agregar actividad..."
                  value={nuevaActividad}
                  onChange={e => setNuevaActividad(e.target.value)}
                />
                <CustomButton type="button" onClick={async () => {
                  if (nuevaActividad.trim()) {
                    if (editMeta) {
                      const newActivity = await createActividad(editMeta.id, nuevaActividad.trim());
                      if (newActivity) {
                        setNuevaMeta(prev => ({
                          ...prev,
                          actividades: [...(prev.actividades || []), newActivity]
                        }));
                        setNuevaActividad("");
                        
                        // Actualizar también en la lista principal
                        const updatedMetas = await fetchMetas();
                        setMetas(updatedMetas);
                      }
                    } else {
                      // Para nuevas metas, agregar temporalmente
                      setNuevaMeta(prev => ({
                        ...prev,
                        actividades: [
                          ...(prev.actividades || []),
                          { id: `temp-${Date.now()}`, description: nuevaActividad.trim(), isCompleted: false, isCanceled: false }
                        ]
                      }));
                      setNuevaActividad("");
                    }
                  }
                }}>Agregar</CustomButton>
              </div>
              
              <ul className="list-disc list-inside">
                {(nuevaMeta.actividades || []).map((act, idx) => (
                  <li key={act.id || idx} className="flex flex-col gap-2 border-b last:border-b-0 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={act.isCompleted}
                          onChange={() => handleActivityCompletionToggle(act.id)}
                          className="form-checkbox"
                        />
                        <span className={`text-sm ${act.isCompleted ? 'line-through text-gray-500' : ''} ${act.isCanceled ? 'line-through text-red-500' : ''}`}>
                          {act.description}
                        </span>
                      </div>
                      {editMeta && !act.isCompleted && !act.isCanceled && (
                         <CustomButton variant="destructive" size="sm" onClick={() => handleActivityCancellation(act.id)}>Cancelar Actividad</CustomButton>
                      )}
                       {editMeta && act.isCanceled && (
                         <span className="text-red-500 text-xs">Cancelada</span>
                       )}
                    </div>
                    {editMeta && act.isCanceled && (
                      <div className="ml-6">
                        <label className="block font-semibold mb-1 text-sm">Razón de Cancelación:</label>
                        <textarea
                          className="w-full border rounded p-1 text-sm"
                          value={act.cancelReason || ''}
                          onChange={(e) => handleActivityReasonChange(act.id, e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </li>
                ))}
                {(nuevaMeta.actividades || []).length === 0 && <li className="text-sm text-gray-500">- No hay actividades agregadas -</li>}
              </ul>
            </div>

            {/* Indicadores Section - ACTUALIZADA */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Indicadores</label>
              
              {/* Message Display */}
              {uploadMessage && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">{uploadMessage}</p>
                </div>
              )}
              
              {/* Add Link Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="border rounded p-2 flex-1"
                  placeholder="Agregar enlace de indicador..."
                  value={newIndicatorLink}
                  onChange={e => setNewIndicatorLink(e.target.value)}
                />
                <CustomButton type="button" onClick={handleAddIndicatorLink}>Agregar Enlace</CustomButton>
              </div>
              
              {/* File Uploader - NUEVO */}
              {editMeta && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subir Archivos (PDF, Imágenes, Documentos):</label>
                  <FileUploader
                    bucketName="archivos"
                    folder={`metas/${editMeta.id}`}
                    multiple={true}
                    maxSize={10}
                    acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onUploadComplete={handleFileUploadComplete}
                    className="border-2 border-dashed border-gray-300 rounded-lg"
                  />
                </div>
              )}
              
              {!editMeta && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">💡 Para subir archivos, primero guarda la meta y luego edítala.</p>
                </div>
              )}

              {/* List of Indicators */}
              <div className="mb-2">
                <h4 className="font-medium text-sm mb-2">Indicadores agregados:</h4>
                <ul className="list-disc list-inside max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                  {(nuevaMeta.indicadores || []).map((indicator, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b last:border-b-0 py-1">
                      <span className="text-sm">
                        {indicator.type === 'link' ? (
                          <a href={indicator.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            🔗 {indicator.value.length > 50 ? indicator.value.substring(0, 50) + '...' : indicator.value}
                          </a>
                        ) : (
                          <a
                            href={indicator.value.startsWith('http') ? indicator.value : `/uploads/${indicator.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            📄 {indicator.value.startsWith('http') ? 'Archivo en la nube' : indicator.value}
                          </a>
                        )}
                      </span>
                      <CustomButton variant="destructive" size="sm" onClick={() => handleRemoveIndicator(idx)}>×</CustomButton>
                    </li>
                  ))}
                  {!(nuevaMeta.indicadores || []).length && <li className="text-sm text-gray-500">- No hay indicadores agregados -</li>}
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Responsable</label>
              <select
                className="w-full border rounded p-2"
                value={nuevaMeta.responsable_id || ''}
                onChange={e => {
                  const selectedUserId = parseInt(e.target.value);
                  const selectedUser = usuarios.find(user => user.id === selectedUserId);
                  setNuevaMeta({ 
                    ...nuevaMeta, 
                    responsable_id: selectedUserId,
                    responsable: selectedUser?.full_name || ''
                  });
                }}
                required
              >
                <option value="">Seleccionar Responsable</option>
                {usuarios.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Fecha Límite</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={nuevaMeta.fecha_fin}
                onChange={e => setNuevaMeta({ ...nuevaMeta, fecha_fin: e.target.value })}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
                Cancelar
              </CustomButton>
              <CustomButton type="submit" disabled={loading}>
                {loading ? "Guardando..." : (editMeta ? "Guardar" : "Agregar")}
              </CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 