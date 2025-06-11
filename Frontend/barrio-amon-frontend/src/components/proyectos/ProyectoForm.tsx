"use client";
import { useState, useEffect } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/storage/FileUploader";

export interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
  objetivo_id: number;
  estado_avance: string;
  fecha_inicio: string;
  fecha_fin: string;
  colaboradores: string;
  responsable: string;
  Tareas?: Tarea[];
  IndicadoresProyecto?: IndicadorProyecto[];
}

interface ObjetivoSmart {
  id?: number;
  proyecto_id?: number;
  nombre: string;
  descripcion: string;
  cumplida: boolean;
}

interface IndicadorProyecto {
  id?: number;
  tipo: string;
  valor: string;
  proyecto_id?: number;
}

interface Tarea {
  id?: number;
  nombre: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Pendiente' | 'En proceso' | 'Completada' | 'Cancelada';
  evidencias?: File[];
  cancel_reason?: string;
}

interface UploadedFile {
  file: string;
  url: string;
  name?: string;
  type?: string;
  data?: unknown;
}

// const apiCall = async (url: string, options: RequestInit = {}) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}${url}`, {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error(`Error en API call ${url}:`, error);
//     throw error;
//   }
// };

export default function ProyectoForm({
  modo,
  proyecto = {},
  onCancel,
  onSave
}: {
  modo: "crear" | "editar";
  proyecto?: Partial<Proyecto>;
  onCancel: () => void;
  onSave?: (p: Proyecto) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Proyecto>({
    nombre: proyecto.nombre || "",
    descripcion: proyecto.descripcion || "",
    objetivo_id: proyecto.objetivo_id || 0,
    estado_avance: proyecto.estado_avance || "",
    fecha_inicio: proyecto.fecha_inicio || "",
    fecha_fin: proyecto.fecha_fin || "",
    colaboradores: proyecto.colaboradores || "",
    responsable: proyecto.responsable || "",
    Tareas: proyecto.Tareas || [],
  });
  const [loading, setLoading] = useState(false);
  const [objetivos, setObjetivos] = useState<{ id: number; nombre: string }[]>([]);
  const [showObjetivoForm, setShowObjetivoForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");
  const [usuarios, setUsuarios] = useState<{ id: string; full_name: string }[]>([]);
  const [objetivosSmart, setObjetivosSmart] = useState<ObjetivoSmart[]>([]);
  const [nuevoSmart, setNuevoSmart] = useState<{ nombre: string; descripcion: string }>({ nombre: "", descripcion: "" });
  const [indicadoresProyecto, setIndicadoresProyecto] = useState<IndicadorProyecto[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [editTarea, setEditTarea] = useState<Tarea | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetch("https://amonhub.onrender.com/api/objetivos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      })
      .catch(error => {
        console.error("Error fetching objetivos:", error);
        setObjetivos([]);
      });
    fetch("https://amonhub.onrender.com/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsuarios(data);
        else setUsuarios([]);
      })
      .catch(error => {
        console.error("Error fetching usuarios:", error);
        setUsuarios([]);
      });
    if (modo === "editar" && proyecto.id) {
      fetch(`https://amonhub.onrender.com/api/proyectos/${proyecto.id}/objetivos-smart`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setObjetivosSmart(data);
        })
        .catch(error => {
          console.error("Error fetching objetivos-smart:", error);
          setObjetivosSmart([]);
        });

      fetch(`https://amonhub.onrender.com/api/proyectos/${proyecto.id}/indicadores-proyecto`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setIndicadoresProyecto(data);
        })
        .catch(error => {
          console.error("Error fetching indicadores de proyecto:", error);
          setIndicadoresProyecto([]);
        });

      // Fetch existing tasks if editing
      fetch(`https://amonhub.onrender.com/api/proyectos/${proyecto.id}/tareas`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setTareas(data);
          else setTareas([]);
        })
        .catch(error => {
          console.error("Error fetching tasks:", error);
          setTareas([]);
        });
    }
  }, [modo, proyecto.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const auxTareas = tareas;

    try {
      const url = modo === "crear"
        ? "https://amonhub.onrender.com/api/proyectos"
        : `https://amonhub.onrender.com/api/proyectos/${proyecto.id}`;
      const method = modo === "crear" ? "POST" : "PUT";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { Tareas, ...formSinTareas } = form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formSinTareas),
      });

      if (!res.ok) throw new Error("Error al guardar el proyecto");

      const proyectoGuardado = await res.json();

      if (objetivosSmart.length > 0) {
        // Primero, elimina los existentes
        await fetch(`https://amonhub.onrender.com/api/proyectos/${proyectoGuardado.id}/objetivos-smart`, {
          method: "DELETE"
        });

        // Luego, inserta los nuevos
        const objetivosSmartConProyectoId = objetivosSmart.map(obj => {
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = obj;
          return {
            ...rest,
            proyecto_id: proyectoGuardado.id
          };
        });

        await fetch(`https://amonhub.onrender.com/api/proyectos/${proyectoGuardado.id}/objetivos-smart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(objetivosSmartConProyectoId),
        });
      }

      // Guardar tareas (crear o actualizar)
      for (const tarea of (auxTareas ?? [])) {
        // Elimina campos que no existen en la tabla si es necesario
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { evidencias, ...rest } = tarea;
        const tareaData = { ...rest, proyecto_id: proyectoGuardado.id };

        if (!tarea.id) {
          // Crear nueva tarea
          await fetch(`https://amonhub.onrender.com/api/proyectos/${proyectoGuardado.id}/tareas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tareaData),
          });
        } else {
          // Actualizar tarea existente
          await fetch(`https://amonhub.onrender.com/api/tareas/${tarea.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tareaData),
          });
        }
      }

      setLoading(false);
      if (onSave) onSave(proyectoGuardado);
      
      // Navigate back to the projects page
      router.push("/proyectos/lista");
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleCrearObjetivo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("https://amonhub.onrender.com/api/objetivos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoNombre, descripcion: nuevoDescripcion }),
    });
    if (res.ok) {
      const data = await res.json();
      setObjetivos((prev) => [...prev, data]);
      setForm((f) => ({ ...f, objetivo_id: data.id }));
      setShowObjetivoForm(false);
      setNuevoNombre("");
      setNuevoDescripcion("");
    }
  };

  // Utilidad para manejar colaboradores como array
  const colaboradoresArray = form.colaboradores ? form.colaboradores.split(",") : [];
  // Si el responsable está en colaboradores, lo quitamos automáticamente
  useEffect(() => {
    if (form.responsable && colaboradoresArray.includes(form.responsable)) {
      setForm({
        ...form,
        colaboradores: colaboradoresArray.filter((c) => c !== form.responsable).join(","),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.responsable]);
  const handleAddColaborador = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !colaboradoresArray.includes(value)) {
      setForm({ ...form, colaboradores: [...colaboradoresArray, value].join(",") });
    }
  };
  const handleRemoveColaborador = (name: string) => {
    setForm({
      ...form,
      colaboradores: colaboradoresArray.filter((c) => c !== name).join(","),
    });
  };

  const handleAddSmart = () => {
    if (nuevoSmart.nombre.trim() && nuevoSmart.descripcion.trim()) {
      setObjetivosSmart([...objetivosSmart, { ...nuevoSmart, cumplida: false }]);
      setNuevoSmart({ nombre: "", descripcion: "" });
    }
  };
  const handleRemoveSmart = async (idx: number) => {
    const objetivo = objetivosSmart[idx];
    // Si tiene id, eliminar en backend
    if (objetivo.id) {
      await fetch(`https://amonhub.onrender.com/api/objetivos-smart/${objetivo.id}`, {
        method: "DELETE"
      });
    }
    // Eliminar del estado local
    setObjetivosSmart(objetivosSmart.filter((_, i) => i !== idx));
  };
  const handleCheckSmart = (idx: number) => {
    setObjetivosSmart(objetivosSmart.map((o, i) => i === idx ? { ...o, cumplida: !o.cumplida } : o));
  };
  const handleRemoveIndicador = async (idx: number) => {
    const indicadorToRemove = indicadoresProyecto[idx];
    if (indicadorToRemove.id) {
      try {
        const response = await fetch(`https://amonhub.onrender.com/api/indicadores-proyecto/${indicadorToRemove.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIndicadoresProyecto(indicadoresProyecto.filter((_, i) => i !== idx));
          setUploadMessage('Indicador eliminado exitosamente');
          setTimeout(() => setUploadMessage(''), 3000);
        } else {
          throw new Error('Error al eliminar el indicador');
        }
      } catch (error) {
        console.error('Error deleting indicator:', error);
        setUploadMessage('Error al eliminar el indicador');
        setTimeout(() => setUploadMessage(''), 3000);
      }
    } else {
      setIndicadoresProyecto(indicadoresProyecto.filter((_, i) => i !== idx));
      setUploadMessage('Indicador eliminado localmente');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const handleAddTarea = () => {
    setEditTarea(null);
    setShowTareaModal(true);
  };
  const handleEditTarea = (tarea: Tarea) => {
    setEditTarea(tarea);
    setShowTareaModal(true);
  };
  const handleSaveTarea = (tarea: Tarea) => {
    if (editTarea) {
      setTareas(prev => prev.map(t => t.id === editTarea.id ? tarea : t));
    } else {
      setTareas(prev => [...prev, tarea]);
    }
    setShowTareaModal(false);
    setEditTarea(null);
  };

  const handleTaskCompletionToggle = (taskToToggle: Tarea) => {
    setTareas(prev => prev.map(task =>
      task.id === taskToToggle.id || (task.nombre === taskToToggle.nombre && !task.id && !taskToToggle.id) // Match by id or by name for unsaved tasks
        ? { ...task, estado: task.estado === 'Completada' ? 'Pendiente' : 'Completada', cancel_reason: undefined } // Toggle completed, ensure not canceled
        : task
    ));
  };

  const handleTaskCancellation = (taskToCancel: Tarea) => {
     setTareas(prev => prev.map(task =>
      task.id === taskToCancel.id || (task.nombre === taskToCancel.nombre && !task.id && !taskToCancel.id)
        ? { ...task, estado: 'Cancelada'} // Mark canceled, ensure not completed
        : task
    ));
  };

  const handleTaskReasonChange = (taskToUpdate: Tarea, reason: string) => {
     setTareas(prev => prev.map(task =>
       task.id === taskToUpdate.id || (task.nombre === taskToUpdate.nombre && !task.id && !taskToUpdate.id)
         ? { ...task, cancel_reason: reason }
         : task
     ));
  };

  // Nueva función para manejar archivos subidos desde Supabase Storage
  const handleFileUploadComplete = async (uploadedFiles: UploadedFile[]) => {
    if (!proyecto.id) {
      setUploadMessage('Error: No se puede subir archivos sin un proyecto seleccionado');
      return;
    }

    try {
      // Guardar cada archivo subido como indicador en la base de datos
      for (const file of uploadedFiles) {
        const response = await fetch(`https://amonhub.onrender.com/api/proyectos/${proyecto.id}/indicadores-proyecto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo: file.name || file.type, // Usar el nombre del archivo si está disponible, sino usar el tipo
            valor: file.url
          }),
        });

        if (!response.ok) {
          throw new Error('Error al guardar el archivo');
        }
      }
      
      setUploadMessage(`${uploadedFiles.length} archivo(s) subido(s) exitosamente`);
      setTimeout(() => setUploadMessage(''), 3000);
      
      // After successful uploads, refetch the updated list of indicators
      const updatedIndicators = await fetch(`https://amonhub.onrender.com/api/proyectos/${proyecto.id}/indicadores-proyecto`).then(res => res.json());
      if (Array.isArray(updatedIndicators)) {
        setIndicadoresProyecto(updatedIndicators);
      }
    } catch (error) {
      console.error('Error saving files:', error);
      setUploadMessage('Error al guardar los indicadores en la base de datos');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 z-50  ">
      <div>
        <label className="block font-semibold">Nombre</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block font-semibold">Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block font-semibold">Objetivo Estratégico</label>
        <div className="flex gap-2 items-center">
          <select
            name="objetivo_id"
            value={form.objetivo_id || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            disabled={objetivos.length === 0}
          >
            <option value="">
              {objetivos.length === 0 ? "No hay objetivos, crea uno primero" : "Selecciona un objetivo"}
            </option>
            {objetivos.map((obj) => (
              <option key={obj.id} value={obj.id}>{obj.nombre}</option>
            ))}
          </select>
          <CustomButton type="button" size="sm" onClick={() => setShowObjetivoForm(true)}>
            Crear nuevo objetivo
          </CustomButton>
        </div>
      </div>
      <div>
        <label className="block font-semibold">Objetivos Específicos del Proyecto (SMART)</label>
        <div className="mb-2 flex gap-2">
          <input
            className="border rounded p-2 flex-1"
            placeholder="Nombre del objetivo SMART"
            value={nuevoSmart.nombre}
            onChange={e => setNuevoSmart({ ...nuevoSmart, nombre: e.target.value })}
          />
          <input
            className="border rounded p-2 flex-1"
            placeholder="Descripción SMART"
            value={nuevoSmart.descripcion}
            onChange={e => setNuevoSmart({ ...nuevoSmart, descripcion: e.target.value })}
          />
          <CustomButton type="button" onClick={handleAddSmart}>Agregar</CustomButton>
        </div>
        <ul className="mb-2">
          {objetivosSmart.map((o, idx) => (
            <li key={idx} className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={o.cumplida} onChange={() => handleCheckSmart(idx)} />
              <span className={o.cumplida ? "line-through" : ""}>{o.nombre}: {o.descripcion}</span>
              <button type="button" className="text-red-500" onClick={() => handleRemoveSmart(idx)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label className="block font-semibold">Responsable</label>
        <select
          className="w-full border rounded p-2"
          value={form.responsable}
          onChange={e => setForm({ ...form, responsable: e.target.value })}
        >
          <option value="">Selecciona un responsable</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.full_name}>{u.full_name}</option>
          ))}
        </select>
        <div className="text-xs text-gray-500">Solo puede haber un responsable por proyecto.</div>
      </div>
      <div>
        <label className="block font-semibold">Colaboradores</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {colaboradoresArray.map((colab) => (
            <span key={colab} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
              {colab}
              <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleRemoveColaborador(colab)}>
                ×
              </button>
            </span>
          ))}
        </div>
        <select
          className="w-full border rounded p-2"
          value=""
          onChange={handleAddColaborador}
        >
          <option value="">Agregar colaborador...</option>
          {usuarios.filter(u => u.full_name !== form.responsable && !colaboradoresArray.includes(u.full_name)).map((u) => (
            <option key={u.id} value={u.full_name}>{u.full_name}</option>
          ))}
        </select>
        <div className="text-xs text-gray-500">Selecciona uno o varios colaboradores registrados.</div>
      </div>
      <div>
        <label className="block font-semibold">Tareas del Proyecto</label>
        <ul className="mb-2">
          {tareas.map((t, idx) => (
            <li key={t.id || idx} className="flex flex-col gap-2 border-b last:border-b-0 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.estado === 'Completada'}
                    onChange={() => handleTaskCompletionToggle(t)}
                    className="form-checkbox"
                    disabled={t.estado === 'Cancelada'} // Disable checkbox if canceled
                  />
                  <span className={`text-sm ${t.estado === 'Completada' ? 'line-through text-gray-500' : ''} ${t.estado === 'Cancelada' ? 'line-through text-red-500' : ''}`}>
                    {t.nombre} ({t.responsable})
                  </span>
                </div>
                 {/* Actions: Edit and Cancel (if not completed or canceled) */}
                <div className="flex items-center gap-2">
                  <button type="button" className="text-blue-500" onClick={() => handleEditTarea(t)}>Editar</button>
                  {t.estado !== 'Completada' && t.estado !== 'Cancelada' && (
                     <button type="button" className="text-red-500" onClick={() => handleTaskCancellation(t)}>Cancelar Tarea</button>
                  )}
                   {t.estado === 'Cancelada' && (
                     <span className="text-red-500 text-xs">Cancelada</span>
                   )}
                </div>
              </div>
              {/* Show reason input if canceled */}
              {t.estado === 'Cancelada' && (modo === 'editar' || !t.id) && ( // Show reason if canceled and editing or if it's a new unsaved task
                 <div className="ml-6">
                   <label className="block font-semibold mb-1 text-sm">Razón de Cancelación:</label>
                   <textarea
                     className="w-full border rounded p-1 text-sm"
                     value={t.cancel_reason || ''}
                     onChange={(e) => handleTaskReasonChange(t, e.target.value)}
                     rows={2}
                   />
                 </div>
              )}
            </li>
          ))}
           {/* Display message if no tasks */}
          {tareas.length === 0 && (<li className="text-sm text-gray-500">- No hay tareas agregadas -</li>)}
        </ul>
        <button type="button" className="bg-green-500 text-white px-2 rounded" onClick={handleAddTarea}>Agregar Tarea</button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Fecha de inicio</label>
          <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Fecha de fin</label>
          <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
      </div>
      {modo === "editar" && (
        <>
          <div className="mb-4">
            <label htmlFor="estado_avance" className="block text-sm font-medium text-gray-700">Estado de Avance</label>
            <select
              id="estado_avance"
              name="estado_avance"
              value={form.estado_avance}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Seleccionar estado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Evidencias (PDFs)</label>
            
            {/* Message Display */}
            {uploadMessage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">{uploadMessage}</p>
              </div>
            )}
            
            {/* File Uploader */}
            <div className="mb-4">
              <FileUploader
                bucketName="archivos"
                folder={`proyectos/${proyecto.id}`}
                multiple={true}
                maxSize={10}
                acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onUploadComplete={handleFileUploadComplete}
                className="border-2 border-dashed border-gray-300 rounded-lg"
              />
            </div>

            {/* List of uploaded files */}
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Indicadores subidos:</h4>
              <ul className="list-disc list-inside max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {(indicadoresProyecto || []).map((indicador, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b last:border-b-0 py-1">
                    <span className="text-sm">
                      <a
                        href={indicador.valor}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📄 {indicador.tipo}
                      </a>
                    </span>
                    <CustomButton variant="destructive" size="sm" onClick={() => handleRemoveIndicador(idx)}>×</CustomButton>
                  </li>
                ))}
                {indicadoresProyecto.length === 0 && <li className="text-sm text-gray-500">- No hay indicadores subidos -</li>}
              </ul>
            </div>
          </div>
        </>
      )}
      <div className="flex justify-end gap-2 mt-6">
        <CustomButton type="button" variant="outline" onClick={onCancel}>Atrás</CustomButton>
        <CustomButton type="submit" disabled={loading}>{modo === "crear" ? "Crear" : "Guardar"}</CustomButton>
      </div>
      <TareaModal show={showTareaModal} onClose={() => setShowTareaModal(false)} tarea={editTarea || undefined} onSave={handleSaveTarea} usuarios={usuarios} />
      {showObjetivoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={handleCrearObjetivo} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Crear Objetivo</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Nombre</label>
              <input className="w-full border rounded p-2" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea className="w-full border rounded p-2" value={nuevoDescripcion} onChange={e => setNuevoDescripcion(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowObjetivoForm(false)}>Cancelar</CustomButton>
              <CustomButton type="submit">Crear</CustomButton>
            </div>
          </form>
        </div>
      )}
    </form>
  );
}

// =============================================
// COMPONENTE MODAL DE TAREAS
// =============================================

function TareaModal({
  show,
  onClose,
  tarea,
  onSave,
  usuarios
}: {
  show: boolean;
  onClose: () => void;
  tarea?: Tarea;
  onSave: (t: Tarea) => void;
  usuarios: { id: string; full_name: string }[];
}) {
  // Estados del componente
  const [formTarea, setFormTarea] = useState<Tarea>(tarea || {
    nombre: "",
    responsable: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "Pendiente",
    evidencias: [],
    cancel_reason: undefined,
  });
  const [indicadoresTarea, setIndicadoresTarea] = useState<IndicadorProyecto[]>([]);
  const [uploadMessage, setUploadMessage] = useState('');

  // Efecto para actualizar el formulario cuando cambia la tarea
  useEffect(() => {
    // Inicializar o actualizar el formulario
    setFormTarea(tarea || {
      nombre: "",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "Pendiente",
      evidencias: [],
      cancel_reason: undefined,
    });

    // Cargar indicadores si estamos editando una tarea existente
    if (tarea?.id) {
      fetch(`https://amonhub.onrender.com/api/tareas/${tarea.id}/indicadores`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setIndicadoresTarea(data);
          }
        })
        .catch(error => {
          console.error('Error al cargar los indicadores de la tarea:', error);
          setIndicadoresTarea([]);
        });
    }
  }, [tarea]);

  // =============================================
  // MANEJADORES DE EVENTOS
  // =============================================

  // Manejar cambios en los campos del formulario
  const handleChangeTarea = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const type = target.type;

    if (type === 'checkbox' && target instanceof HTMLInputElement) {
      const checked = target.checked;
      setFormTarea(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormTarea(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Guardar la tarea
  const handleSave = () => {
    onSave(formTarea);
    onClose();
  };

  // Manejar la subida de archivos
  const handleFileUploadComplete = async (uploadedFiles: UploadedFile[]) => {
    if (!tarea?.id) {
      setUploadMessage('Error: No se puede subir archivos sin una tarea guardada');
      return;
    }

    try {
      // Guardar cada archivo como indicador en la base de datos
      for (const file of uploadedFiles) {
        const response = await fetch(`https://amonhub.onrender.com/api/tareas/${tarea.id}/indicadores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo: file.name || file.type,
            valor: file.url
          }),
        });

        if (!response.ok) {
          throw new Error('Error al guardar el archivo');
        }
      }
      
      setUploadMessage(`${uploadedFiles.length} archivo(s) subido(s) exitosamente`);
      setTimeout(() => setUploadMessage(''), 3000);
      
      // Actualizar la lista de indicadores después de la subida
      const updatedIndicators = await fetch(`https://amonhub.onrender.com/api/tareas/${tarea.id}/indicadores`).then(res => res.json());
      if (Array.isArray(updatedIndicators)) {
        setIndicadoresTarea(updatedIndicators);
      }
    } catch (error) {
      console.error('Error al guardar los archivos:', error);
      setUploadMessage('Error al guardar los indicadores en la base de datos');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  // Eliminar un indicador
  const handleRemoveIndicador = async (idx: number) => {
    const indicadorToRemove = indicadoresTarea[idx];
    if (indicadorToRemove.id) {
      try {
        const response = await fetch(`https://amonhub.onrender.com/api/indicadores-tarea/${indicadorToRemove.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIndicadoresTarea(indicadoresTarea.filter((_, i) => i !== idx));
          setUploadMessage('Indicador eliminado exitosamente');
          setTimeout(() => setUploadMessage(''), 3000);
        } else {
          throw new Error('Error al eliminar el indicador');
        }
      } catch (error) {
        console.error('Error al eliminar el indicador:', error);
        setUploadMessage('Error al eliminar el indicador');
        setTimeout(() => setUploadMessage(''), 3000);
      }
    }
  };

  // No renderizar si no se muestra el modal
  if (!show) return null;

  // =============================================
  // RENDERIZADO DEL COMPONENTE
  // =============================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md my-8">
        {/* Encabezado del modal */}
        <h2 className="text-2xl font-bold mb-4 text-[#546b75]">{tarea ? "Editar Tarea" : "Crear Tarea"}</h2>
        
        {/* Contenido del formulario */}
        <div className="space-y-4">
          {/* Campo Nombre */}
          <div className="mb-4">
            <label htmlFor="nombreTarea" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              id="nombreTarea"
              name="nombre"
              value={formTarea.nombre}
              onChange={handleChangeTarea}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          {/* Campo Responsable */}
          <div className="mb-4">
            <label htmlFor="responsableTarea" className="block text-sm font-medium text-gray-700">Responsable</label>
            <select
              id="responsableTarea"
              name="responsable"
              value={formTarea.responsable}
              onChange={handleChangeTarea}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Seleccione un responsable</option>
              {usuarios.map(user => (
                <option key={user.id} value={user.full_name}>{user.full_name}</option>
              ))}
            </select>
          </div>

          {/* Campos de Fecha */}
          <div className="mb-4">
            <label htmlFor="fechaInicioTarea" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              id="fechaInicioTarea"
              name="fecha_inicio"
              value={formTarea.fecha_inicio}
              onChange={handleChangeTarea}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="fechaFinTarea" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              id="fechaFinTarea"
              name="fecha_fin"
              value={formTarea.fecha_fin}
              onChange={handleChangeTarea}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          {/* Estado de la tarea (solo en modo edición) */}
          {tarea && (
            <div className="mb-4">
              <label htmlFor="estadoTarea" className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                id="estadoTarea"
                name="estado"
                value={formTarea.estado}
                onChange={handleChangeTarea}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                disabled={formTarea.estado === 'Cancelada'}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
          )}
          
          {/* Checkbox de completado */}
          <div className="mb-4">
            <label htmlFor="taskCompleted" className="block text-sm font-medium text-gray-700">Completada</label>
            <input
              type="checkbox"
              id="taskCompleted"
              checked={formTarea.estado === 'Completada'}
              onChange={(e) => setFormTarea({...formTarea, estado: e.target.checked ? 'Completada' : 'Pendiente', cancel_reason: undefined})}
              className="form-checkbox"
              disabled={formTarea.estado === 'Cancelada'}
            />
          </div>

          {/* Razón de cancelación (solo si está cancelada) */}
          {formTarea.estado === 'Cancelada' && (
            <div className="mb-4">
              <label htmlFor="cancel_reason" className="block text-sm font-medium text-gray-700">Razón de Cancelación</label>
              <textarea
                id="cancel_reason"
                name="cancel_reason"
                value={formTarea.cancel_reason || ''}
                onChange={handleChangeTarea}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={2}
              />
            </div>
          )}
          
          {/* Sección de Evidencias (solo en modo edición) */}
          {tarea && (
            <div className="mb-4">
              <label className="block font-semibold">Evidencias</label>
              
              {/* Mensajes de estado */}
              {uploadMessage && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">{uploadMessage}</p>
                </div>
              )}
              
              {/* Componente de subida de archivos */}
              <div className="mb-4">
                <FileUploader
                  bucketName="archivos"
                  folder={`tareas/${tarea.id}`}
                  multiple={true}
                  maxSize={10}
                  acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onUploadComplete={handleFileUploadComplete}
                  className="border-2 border-dashed border-gray-300 rounded-lg"
                />
              </div>

              {/* Lista de archivos subidos */}
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Evidencias subidas:</h4>
                <ul className="list-disc list-inside max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                  {indicadoresTarea.map((indicador, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b last:border-b-0 py-1">
                      <span className="text-sm">
                        <a
                          href={indicador.valor}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          📄 {indicador.tipo}
                        </a>
                      </span>
                      <CustomButton variant="destructive" size="sm" onClick={() => handleRemoveIndicador(idx)}>×</CustomButton>
                    </li>
                  ))}
                  {indicadoresTarea.length === 0 && <li className="text-sm text-gray-500">- No hay evidencias subidas -</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 mt-4 sticky bottom-0 bg-white pt-4 border-t">
          <CustomButton variant="outline" onClick={onClose}>Cancelar</CustomButton>
          <CustomButton onClick={handleSave}>Guardar Tarea</CustomButton>
        </div>
      </div>
    </div>
  );
} 