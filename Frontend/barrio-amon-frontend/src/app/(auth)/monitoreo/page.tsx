"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Objetivo {
  id: string;
  nombre: string;
  descripcion?: string;
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
  indicadores?: Indicator[];
  anio?: number; // Computed from fecha_fin
}

interface Activity {
  id: string;
  description: string;
  isCompleted: boolean;
  isCanceled: boolean;
  cancelReason?: string;
}

interface Indicator {
  id: string;
  tipo: 'link' | 'file';
  valor: string;
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

// Función para extraer año de fecha
const extraerAnio = (fecha: string): number => {
  return new Date(fecha).getFullYear();
};

// API Functions
const fetchObjetivos = async (): Promise<Objetivo[]> => {
  try {
    const data = await apiCall('/objetivos');
    return data.map((obj: any) => ({
      id: obj.id.toString(),
      nombre: obj.nombre,
      descripcion: obj.descripcion
    }));
  } catch (error) {
    console.error('Error fetching objetivos:', error);
    return [];
  }
};

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
        id: ind.id.toString(),
        tipo: ind.tipo,
        valor: ind.valor
      })) || [],
      anio: extraerAnio(meta.fecha_fin)
    }));
  } catch (error) {
    console.error('Error fetching metas:', error);
    return [];
  }
};

export default function MonitoreoPage() {
  const router = useRouter();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Generate a list of years for the dropdown based on available data
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: (currentYear + 5) - 2023 + 1 }, (_, i) => 2023 + i);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [objetivosData, metasData] = await Promise.all([
          fetchObjetivos(),
          fetchMetas()
        ]);
        
        setObjetivos(objetivosData);
        setMetas(metasData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar metas por año seleccionado
  const metasFiltradas = metas.filter(meta => meta.anio === selectedYear);

  // Agrupar metas por objetivo
  const objetivosConMetas = objetivos.map(objetivo => {
    const metasDelObjetivo = metasFiltradas.filter(meta => 
      meta.objetivos.includes(objetivo.id)
    );
    
    return {
      ...objetivo,
      metas: metasDelObjetivo
    };
  }).filter(objetivo => objetivo.metas.length > 0); // Solo objetivos con metas en el año seleccionado

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando datos de monitoreo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Year Selection */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="yearSelect" className="font-semibold text-gray-700">Seleccionar Año:</label>
        <select
          id="yearSelect"
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md shadow-sm p-2"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">Plan Operativo {selectedYear}</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-[#4A6670] text-white">
              <th className="border border-gray-300 py-2 px-4 text-left">Objetivos Estratégicos</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Metas</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Actividades</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Indicadores</th>
            </tr>
          </thead>
          <tbody>
            {objetivosConMetas.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-gray-300 py-2 px-4 text-center text-gray-500 italic">
                  No hay datos disponibles para el año seleccionado.
                </td>
              </tr>
            ) : (
              objetivosConMetas.map((objetivo, objIndex) => {
                const objetivoMetas = objetivo.metas;

                // Calculate total rows for the objective
                const totalObjectiveRows = objetivoMetas.reduce((metaSum: number, meta: Meta) => {
                  const totalMetaRows = Math.max(meta.actividades?.length || 0, 1);
                  return metaSum + totalMetaRows;
                }, 0) || 1;

                let isFirstObjectiveRow = true;

                return objetivoMetas.flatMap((meta: Meta, metaIndex: number) => {
                  const metaActivities = meta.actividades || [];

                  // Calculate total rows for the meta
                  const totalMetaRows = Math.max(metaActivities.length, 1);

                  let isFirstMetaRow = true;

                  if (metaActivities.length === 0) {
                    // Case: Meta with no activities
                    const row = (
                      <tr key={`${meta.id}-no-activities`} className={objIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {isFirstObjectiveRow && (
                          <td rowSpan={totalObjectiveRows} className="border border-gray-300 py-2 px-4 font-semibold align-top">
                            <div>
                              <div className="font-bold">{objetivo.nombre}</div>
                              {objetivo.descripcion && (
                                <div className="text-sm text-gray-600 mt-1">{objetivo.descripcion}</div>
                              )}
                            </div>
                          </td>
                        )}
                        {isFirstMetaRow && (
                          <td rowSpan={totalMetaRows} className="border border-gray-300 py-2 px-4 text-sm align-top">
                            <div>
                              <div className="font-medium">{meta.descripcion}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                <div>Responsable: {meta.responsable}</div>
                                <div>Fecha límite: {meta.fecha_fin}</div>
                                <div>Estado: <span className={`font-medium ${
                                  meta.estado === 'Completada' ? 'text-green-600' :
                                  meta.estado === 'En progreso' ? 'text-yellow-600' : 'text-gray-600'
                                }`}>{meta.estado}</span></div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="border border-gray-300 py-2 px-4 text-center text-gray-500 italic">
                          No hay actividades para esta meta.
                        </td>
                        <td className="border border-gray-300 py-2 px-4 text-sm">
                          {meta.indicadores && meta.indicadores.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {meta.indicadores.map((indicator, idx) => (
                                <li key={idx} className="text-sm">
                                  {indicator.tipo === 'link' ? (
                                    <a href={indicator.valor} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {indicator.valor}
                                    </a>
                                  ) : (
                                    <a
                                      href={`/uploads/${indicator.valor}`}
                                      download
                                      className="text-blue-600 hover:underline"
                                      target="_blank"
                                    >
                                      {indicator.valor}
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 italic">Sin indicadores</span>
                          )}
                        </td>
                      </tr>
                    );
                    isFirstObjectiveRow = false;
                    isFirstMetaRow = false;
                    return row;
                  } else {
                    // Case: Meta with activities
                    return metaActivities.map((activity: Activity, activityIndex: number) => {
                      const row = (
                        <tr key={`${meta.id}-activity-${activityIndex}`} className={objIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {/* Objective Cell */}
                          {isFirstObjectiveRow && (
                            <td rowSpan={totalObjectiveRows} className="border border-gray-300 py-2 px-4 font-semibold align-top">
                              <div>
                                <div className="font-bold">{objetivo.nombre}</div>
                                {objetivo.descripcion && (
                                  <div className="text-sm text-gray-600 mt-1">{objetivo.descripcion}</div>
                                )}
                              </div>
                            </td>
                          )}
                          {/* Meta Cell */}
                          {isFirstMetaRow && (
                            <td rowSpan={totalMetaRows} className="border border-gray-300 py-2 px-4 text-sm align-top">
                              <div>
                                <div className="font-medium">{meta.descripcion}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <div>Responsable: {meta.responsable}</div>
                                  <div>Fecha límite: {meta.fecha_fin}</div>
                                  <div>Estado: <span className={`font-medium ${
                                    meta.estado === 'Completada' ? 'text-green-600' :
                                    meta.estado === 'En progreso' ? 'text-yellow-600' : 'text-gray-600'
                                  }`}>{meta.estado}</span></div>
                                </div>
                              </div>
                            </td>
                          )}
                          {/* Activity Cell */}
                          <td className="border border-gray-300 py-2 px-4 text-sm">
                            <div className={`${
                              activity.isCompleted && !activity.isCanceled ? 'text-green-600' : 
                              activity.isCanceled ? 'line-through text-red-500' : 'text-gray-900'
                            }`}>
                              {activity.description}
                              {activity.isCompleted && !activity.isCanceled && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Completada
                                </span>
                              )}
                              {activity.isCanceled && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  Cancelada
                                </span>
                              )}
                            </div>
                            {activity.isCanceled && activity.cancelReason && (
                              <div className="text-xs text-gray-500 mt-1">
                                Razón: {activity.cancelReason}
                              </div>
                            )}
                          </td>
                          {/* Indicators Cell */}
                          {activityIndex === 0 && (
                            <td rowSpan={totalMetaRows} className="border border-gray-300 py-2 px-4 text-sm align-top">
                              {meta.indicadores && meta.indicadores.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {meta.indicadores.map((indicator, idx) => (
                                    <li key={idx} className="text-sm">
                                      {indicator.tipo === 'link' ? (
                                        <a href={indicator.valor} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                          {indicator.valor}
                                        </a>
                                      ) : (
                                        <a
                                          href={`/uploads/${indicator.valor}`}
                                          download
                                          className="text-blue-600 hover:underline"
                                          target="_blank"
                                        >
                                          {indicator.valor}
                                        </a>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500 italic">Sin indicadores</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                      if (isFirstObjectiveRow) isFirstObjectiveRow = false;
                      if (isFirstMetaRow) isFirstMetaRow = false;
                      return row;
                    });
                  }
                });
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 