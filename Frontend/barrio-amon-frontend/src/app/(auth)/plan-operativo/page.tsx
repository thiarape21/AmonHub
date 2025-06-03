"use client";
import { useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import Select from 'react-select';

interface Objetivo {
  id: string;
  descripcion: string;
}

interface Meta {
  id: string;
  descripcion: string;
  objetivos: string[];
  responsable: string;
  fechaLimite: string;
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

// Datos en duro para objetivos
const objetivosEjemplo: Objetivo[] = [
  { id: "o1", descripcion: "Hacer el barrio más limpio" },
  { id: "o2", descripcion: "Fomentar la participación comunitaria" },
  { id: "o3", descripcion: "Mejorar la seguridad del barrio" },
];

// Datos en duro para metas
const metasEjemplo: Meta[] = [
  {
    id: "m1",
    descripcion: "Recoger basura del barrio en jornadas mensuales",
    objetivos: ["o1"],
    responsable: "Comité Ambiental",
    fechaLimite: "2024-07-30",
    estado: "Pendiente",
    actividades: [
      { id: "a1", description: "Organizar 4 jornadas de recolección", isCompleted: false, isCanceled: false },
      { id: "a2", description: "Coordinar voluntarios", isCompleted: false, isCanceled: false },
      { id: "a3", description: "Disponer de los residuos correctamente", isCompleted: false, isCanceled: false },
    ],
  },
  {
    id: "m2",
    descripcion: "Organizar charlas de concientización ambiental",
    objetivos: ["o1", "o2"],
    responsable: "Comité Ambiental",
    fechaLimite: "2024-08-15",
    estado: "En progreso",
    actividades: [
      { id: "a4", description: "Diseñar material didáctico", isCompleted: true, isCanceled: false },
      { id: "a5", description: "Programar 2 charlas", isCompleted: false, isCanceled: false },
      { id: "a6", description: "Convocar a la comunidad", isCompleted: false, isCanceled: false },
    ],
  },
  {
    id: "m3",
    descripcion: "Instalar más basureros en espacios públicos",
    objetivos: ["o1"],
    responsable: "Municipalidad",
    fechaLimite: "2024-09-01",
    estado: "Pendiente",
    actividades: [
      { id: "a7", description: "Identificar 10 ubicaciones clave", isCompleted: false, isCanceled: false },
      { id: "a8", description: "Comprar 10 basureros", isCompleted: false, isCanceled: false },
      { id: "a9", description: "Instalar basureros en las ubicaciones", isCompleted: false, isCanceled: false },
    ],
  },
];

// Mock user data (replace with actual fetch if needed)
const usuariosEjemplo = [
    { id: "user1", full_name: "Juan Pérez" },
    { id: "user2", full_name: "Ana Gómez" },
    { id: "user3", full_name: "Carlos Ruiz" },
    { id: "user4", full_name: "María López" },
    { id: "user5", full_name: "Pedro Sánchez" },
    { id: "user6", full_name: "Lucía Torres" },
  ];

export default function PlanOperativoPage() {
  const [metas, setMetas] = useState<Meta[]>(metasEjemplo);
  const [showForm, setShowForm] = useState(false);
  const [editMeta, setEditMeta] = useState<Meta | null>(null);
  const [nuevaMeta, setNuevaMeta] = useState<Omit<Meta, "id">>({
    descripcion: "",
    objetivos: [],
    responsable: "",
    fechaLimite: "",
    estado: "Pendiente",
    actividades: [],
    indicadores: [],
  });
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newIndicatorLink, setNewIndicatorLink] = useState('');
  const [newIndicatorFiles, setNewIndicatorFiles] = useState<File[]>([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nuevaMeta.descripcion || nuevaMeta.objetivos.length === 0) return;
    if (editMeta) {
      setMetas(metas.map(m => m.id === editMeta.id ? { ...editMeta, ...nuevaMeta } : m));
    } else {
      setMetas([
        ...metas,
        {
          ...nuevaMeta,
          id: `m${metas.length + 1}`,
        },
      ]);
    }
    setShowForm(false);
    setEditMeta(null);
    setNuevaMeta({ descripcion: "", objetivos: [], responsable: "", fechaLimite: "", estado: "Pendiente", actividades: [], indicadores: [] });
    setNuevaActividad("");
    setNewIndicatorLink('');
    setNewIndicatorFiles([]);
  };

  const handleEdit = (meta: Meta) => {
    setEditMeta(meta);
    setNuevaMeta({
      descripcion: meta.descripcion,
      objetivos: meta.objetivos,
      responsable: meta.responsable,
      fechaLimite: meta.fechaLimite,
      estado: meta.estado,
      actividades: meta.actividades || [],
      indicadores: meta.indicadores || [],
    });
    setShowForm(true);
    setNewIndicatorLink('');
    setNewIndicatorFiles([]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta meta?")) return;
    setMetas(metas.filter(m => m.id !== id));
  };

  const handleActivityCompletionToggle = (activityId: string) => {
    setNuevaMeta(prev => ({
      ...prev,
      actividades: (prev.actividades || []).map(act =>
        act.id === activityId ? { ...act, isCompleted: !act.isCompleted, isCanceled: act.isCompleted ? act.isCanceled : false, cancelReason: act.isCompleted ? act.cancelReason : '' } : act
      ),
    }));
  };

  const handleActivityCancellation = (activityId: string) => {
    setNuevaMeta(prev => ({
      ...prev,
      actividades: (prev.actividades || []).map(act =>
        act.id === activityId ? { ...act, isCanceled: true, isCompleted: false } : act
      ),
    }));
  };

  const handleActivityReasonChange = (activityId: string, reason: string) => {
    setNuevaMeta(prev => ({
      ...prev,
      actividades: (prev.actividades || []).map(act =>
        act.id === activityId ? { ...act, cancelReason: reason } : act
      ),
    }));
  };

  const handleAddIndicatorLink = () => {
    if (newIndicatorLink.trim()) {
      setNuevaMeta(prev => ({
        ...prev,
        indicadores: [...(prev.indicadores || []), { type: 'link', value: newIndicatorLink.trim() }]
      }));
      setNewIndicatorLink('');
    }
  };

  const handleAddIndicatorFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const fileIndicators: Indicator[] = filesArray.map(file => ({ type: 'file', value: file.name }));
      setNuevaMeta(prev => ({
        ...prev,
        indicadores: [...(prev.indicadores || []), ...fileIndicators]
      }));
      setNewIndicatorFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveIndicator = (indexToRemove: number) => {
    setNuevaMeta(prev => ({
      ...prev,
      indicadores: (prev.indicadores || []).filter((_, index) => index !== indexToRemove)
    }));
  };

  const filteredMetas = metas.filter(meta => {
    console.warn("Filtering by year is not fully implemented as Meta interface lacks a year property.");
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b70]">Plan Operativo Anual {selectedYear}</h1>

      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => {
          setShowForm(true);
          setEditMeta(null);
          setNuevaMeta({ descripcion: "", objetivos: [], responsable: "", fechaLimite: "", estado: "Pendiente", actividades: [], indicadores: [] });
          setNuevaActividad("");
          setNewIndicatorLink('');
          setNewIndicatorFiles([]);
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
                const completedActivities = activities.filter(act => act.isCompleted && !act.isCanceled);
                const nonCanceledActivities = activities.filter(act => !act.isCanceled);

                let status = 'Pendiente';
                if (nonCanceledActivities.length > 0 && completedActivities.length === nonCanceledActivities.length) {
                  status = 'Completada';
                } else if (completedActivities.length > 0) {
                  status = 'En progreso';
                }

                return (
                  <tr key={meta.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      {meta.objetivos.map(oid => (
                        <span key={oid} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1">
                          {objetivosEjemplo.find(o => o.id === oid)?.descripcion}
                        </span>
                      ))}
                    </td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{meta.descripcion}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      {(meta.actividades || []).map((act, idx) => (
                        <div key={idx} className={`text-sm ${act.isCompleted && !act.isCanceled ? 'text-green-600' : act.isCanceled ? 'line-through text-red-500' : 'text-gray-900'}`}>
                          - {act.description}
                        </div>
                      ))}
                      {(meta.actividades || []).length === 0 && '-N/A-'}
                    </td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{meta.responsable}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{meta.fechaLimite}</td>
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
                                  href={`/uploads/${indicator.value}`}
                                  download={indicator.type === 'file'}
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                >
                                  {indicator.value}
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
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editMeta ? "Editar Meta" : "Agregar Meta"}
            </h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Objetivos Asociados</label>
              <Select<Option, true>
                isMulti
                options={objetivosEjemplo.map(obj => ({ value: obj.id, label: obj.descripcion }))}
                value={nuevaMeta.objetivos
                  .map(objId => {
                    const objetivo = objetivosEjemplo.find(o => o.id === objId);
                    return objetivo ? { value: objetivo.id, label: objetivo.descripcion } : null;
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
                <CustomButton type="button" onClick={() => {
                  if (nuevaActividad.trim()) {
                    setNuevaMeta(prev => ({
                      ...prev,
                      actividades: [
                        ...(prev.actividades || []),
                        { id: `temp-${Date.now()}`, description: nuevaActividad.trim(), isCompleted: false, isCanceled: false }
                      ]
                    }));
                    setNuevaActividad("");
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

            {/* Indicadores Section */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Indicadores</label>
              {/* Add Link Input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="border rounded p-2 flex-1"
                  placeholder="Agregar enlace de indicador..."
                  value={newIndicatorLink}
                  onChange={e => setNewIndicatorLink(e.target.value)}
                />
                <CustomButton type="button" onClick={handleAddIndicatorLink}>Agregar Enlace</CustomButton>
              </div>
              {/* Add File Input */}
              <div className="mb-2">
                 <label className="block text-sm font-medium text-gray-700">Subir PDF:</label>
                 <input
                   type="file"
                   accept=".pdf"
                   onChange={handleAddIndicatorFiles}
                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4A6670] file:text-white hover:file:bg-[#39525a]"
                 />
              </div>

              {/* List of Indicators */}
              <ul className="list-disc list-inside">
                {(nuevaMeta.indicadores || []).map((indicator, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b last:border-b-0 py-1">
                    <span className="text-sm">
                      {indicator.type === 'link' ? (
                        <a href={indicator.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{indicator.value}</a>
                      ) : (
                        <a
                          href={`/uploads/${indicator.value}`}
                          download={indicator.type === 'file'}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          {indicator.value}
                        </a>
                      )}
                    </span>
                    <CustomButton variant="destructive" size="sm" onClick={() => handleRemoveIndicator(idx)}>Eliminar</CustomButton>
                  </li>
                ))}
                {!(nuevaMeta.indicadores || []).length && <li className="text-sm text-gray-500">- No hay indicadores agregados -</li>}
              </ul>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Responsable</label>
              <select
                className="w-full border rounded p-2"
                value={nuevaMeta.responsable}
                onChange={e => setNuevaMeta({ ...nuevaMeta, responsable: e.target.value })}
                required
              >
                <option value="">Seleccionar Responsable</option>
                {usuariosEjemplo.map(user => (
                  <option key={user.id} value={user.full_name}>{user.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </CustomButton>
              <CustomButton type="submit">
                {editMeta ? "Guardar" : "Agregar"}
              </CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 