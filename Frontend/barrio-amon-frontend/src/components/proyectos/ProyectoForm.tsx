"use client";
import { useState, useEffect } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

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
  tareas?: Tarea[];
}

interface ObjetivoSmart {
  id?: number;
  proyecto_id?: number;
  nombre: string;
  descripcion: string;
  cumplida: boolean;
}

interface Pdf {
  id?: number;
  nombre: string;
  url: string;
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
  cancelReason?: string;
}

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
    tareas: proyecto.tareas || [],
  });
  const [loading, setLoading] = useState(false);
  const [objetivos, setObjetivos] = useState<{ id: number; nombre: string }[]>([]);
  const [showObjetivoForm, setShowObjetivoForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");
  const [usuarios, setUsuarios] = useState<{ id: string; full_name: string }[]>([]);
  const [objetivosSmart, setObjetivosSmart] = useState<ObjetivoSmart[]>([]);
  const [nuevoSmart, setNuevoSmart] = useState<{ nombre: string; descripcion: string }>({ nombre: "", descripcion: "" });
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>(proyecto.tareas || []);
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [editTarea, setEditTarea] = useState<Tarea | null>(null);

  useEffect(() => {
    fetch("http://localhost:3030/api/objetivos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      })
      .catch(error => {
        console.error("Error fetching objetivos:", error);
        setObjetivos([]);
      });
    fetch("http://localhost:3030/api/usuarios")
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
      fetch(`http://localhost:3030/api/proyectos/${proyecto.id}/objetivos-smart`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setObjetivosSmart(data);
        })
        .catch(error => {
          console.error("Error fetching objetivos-smart:", error);
          setObjetivosSmart([]);
        });

      fetch(`http://localhost:3030/api/proyectos/${proyecto.id}/pdfs`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Aquí podrías manejar los PDFs existentes si es necesario
          }
        })
        .catch(error => {
          console.error("Error fetching pdfs:", error);
          // Handle PDF fetch error if needed
        });

      // Fetch existing tasks if editing
      fetch(`http://localhost:3030/api/proyectos/${proyecto.id}/tareas`)
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

    try {
      const url = modo === "crear"
        ? "http://localhost:3030/api/proyectos"
        : `http://localhost:3030/api/proyectos/${proyecto.id}`;
      const method = modo === "crear" ? "POST" : "PUT";

      // Excluye tareas del objeto enviado
      const { tareas, ...formSinTareas } = form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formSinTareas),
      });

      if (!res.ok) throw new Error("Error al guardar el proyecto");

      const proyectoGuardado = await res.json();

      if (objetivosSmart.length > 0) {
        const objetivosSmartConProyectoId = objetivosSmart.map(obj => {
          const { id, ...rest } = obj;
          return {
            ...rest,
            proyecto_id: proyectoGuardado.id
          };
        });

        await fetch(`http://localhost:3030/api/proyectos/${proyectoGuardado.id}/objetivos-smart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(objetivosSmartConProyectoId),
        });
      }

      if (pdfs.length > 0) {
        const formData = new FormData();
        pdfs.forEach((file, index) => {
          formData.append(`pdfs`, file);
        });

        await fetch(`http://localhost:3030/api/proyectos/${proyectoGuardado.id}/pdfs`, {
          method: "POST",
          body: formData,
        });
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
    const res = await fetch("http://localhost:3030/api/objetivos", {
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
  const handleRemoveSmart = (idx: number) => {
    setObjetivosSmart(objetivosSmart.filter((_, i) => i !== idx));
  };
  const handleCheckSmart = (idx: number) => {
    setObjetivosSmart(objetivosSmart.map((o, i) => i === idx ? { ...o, cumplida: !o.cumplida } : o));
  };
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfs([...pdfs, ...Array.from(e.target.files)]);
    }
  };
  const handleRemovePdf = (idx: number) => {
    setPdfs(pdfs.filter((_, i) => i !== idx));
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
      setTareas(tareas.map(t => t === editTarea ? tarea : t));
    } else {
      setTareas([...tareas, tarea]);
    }
    setShowTareaModal(false);
    setEditTarea(null);
  };
  const handleDeleteTarea = (tarea: Tarea) => {
    // Tareas should not be deleted, only canceled.
    // We will remove the delete functionality here.
    // setTareas(tareas.filter(t => t !== tarea));
    console.log("Tarea deletion is disabled. Use cancellation.");
  };

  const handleTaskCompletionToggle = (taskToToggle: Tarea) => {
    setTareas(prev => prev.map(task =>
      task.id === taskToToggle.id || (task.nombre === taskToToggle.nombre && !task.id && !taskToToggle.id) // Match by id or by name for unsaved tasks
        ? { ...task, estado: task.estado === 'Completada' ? 'Pendiente' : 'Completada', isCanceled: false, cancelReason: undefined } // Toggle completed, ensure not canceled
        : task
    ));
  };

  const handleTaskCancellation = (taskToCancel: Tarea) => {
     setTareas(prev => prev.map(task =>
      task.id === taskToCancel.id || (task.nombre === taskToCancel.nombre && !task.id && !taskToCancel.id)
        ? { ...task, estado: 'Cancelada', isCompleted: false } // Mark canceled, ensure not completed
        : task
    ));
  };

  const handleTaskReasonChange = (taskToUpdate: Tarea, reason: string) => {
     setTareas(prev => prev.map(task =>
       task.id === taskToUpdate.id || (task.nombre === taskToUpdate.nombre && !task.id && !taskToUpdate.id)
         ? { ...task, cancelReason: reason }
         : task
     ));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
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
                     value={t.cancelReason || ''}
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
              <option value="Finalizado">Finalizado</option>
              <option value="Atrasado">Atrasado</option>
              {/* Agrega aquí otras opciones si es necesario en el futuro, pero solo 'Finalizado' y 'Atrasado' por ahora */}
            </select>
          </div>
          <div>
            <label className="block font-semibold">Evidencias (PDFs)</label>
            <input type="file" accept="application/pdf" multiple onChange={handlePdfChange} />
            <ul className="mt-2">
              {pdfs.map((file, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>{file.name}</span>
                  <button type="button" className="text-red-500" onClick={() => handleRemovePdf(idx)}>Eliminar</button>
                </li>
              ))}
            </ul>
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
  const [formTarea, setFormTarea] = useState<Tarea>(tarea || {
    nombre: "",
    responsable: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "Pendiente",
    evidencias: [],
    cancelReason: undefined,
  });

  // Update form state when the tarea prop changes (when editing a different task)
  useEffect(() => {
    setFormTarea(tarea || { // Reset to empty or load new tarea
      nombre: "",
      responsable: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "Pendiente",
      evidencias: [],
      cancelReason: undefined,
    });
  }, [tarea]); // Depend on tarea prop

  const handleChangeTarea = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const type = target.type;

    if (type === 'checkbox' && target instanceof HTMLInputElement) {
      const checked = target.checked;
      setFormTarea(prev => ({
        ...prev,
        [name]: checked // Assuming the checkbox name corresponds to a boolean state property, e.g., isCompleted
      }));
    } else {
      setFormTarea(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = () => {
    // Add validation here if needed
    onSave(formTarea);
    onClose(); // Close modal after saving
  };

  const handleEvidenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Append new files to the existing evidencias array
      setFormTarea({ ...formTarea, evidencias: [...(formTarea.evidencias || []), ...Array.from(e.target.files)] });
    }
  };

   const handleRemoveEvidencia = (idx: number) => {
    setFormTarea({ ...formTarea, evidencias: (formTarea.evidencias || []).filter((_, i) => i !== idx) });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-[#546b75]">{tarea ? "Editar Tarea" : "Crear Tarea"}</h2>
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
         {/* Mostrar estado solo en modo edición de tarea */}
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
               disabled={formTarea.estado === 'Cancelada'} // Disable dropdown if canceled
             >
               <option value="Pendiente">Pendiente</option>
               <option value="En proceso">En proceso</option>
               <option value="Completada">Completada</option>
               {/* 'Cancelada' state is handled by the cancel button, not this dropdown */}
               {/* <option value="Cancelada">Cancelada</option> */}
             </select>
           </div>
        )}
        
        {/* Checkbox for completion in the modal */}
        <div className="mb-4">
           <label htmlFor="taskCompleted" className="block text-sm font-medium text-gray-700">Completada</label>
           <input
             type="checkbox"
             id="taskCompleted"
             checked={formTarea.estado === 'Completada'}
             onChange={(e) => setFormTarea({...formTarea, estado: e.target.checked ? 'Completada' : 'Pendiente', cancelReason: undefined})} // Update state based on checkbox
             className="form-checkbox"
             disabled={formTarea.estado === 'Cancelada'} // Disable if canceled
           />
        </div>

        {/* Show cancel reason input in modal if canceled */}
        {formTarea.estado === 'Cancelada' && (
           <div className="mb-4">
             <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">Razón de Cancelación</label>
             <textarea
               id="cancelReason"
               name="cancelReason"
               value={formTarea.cancelReason || ''}
               onChange={handleChangeTarea}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
               rows={2}
             />
           </div>
        )}
        
        {/* Mostrar campo de evidencia solo en modo edición de tarea */}
        {tarea && (
            <div className="mb-4">
              <label htmlFor="evidenciaTarea" className="block text-sm font-medium text-gray-700">Evidencia (PDF)</label>
              <input
                type="file"
                id="evidenciaTarea"
                name="evidencia"
                accept=".pdf"
                onChange={handleEvidenciaChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4A6670] file:text-white hover:file:bg-[#39525a]"
              />
               {/* Display selected file names */}
               {(formTarea.evidencias || []).length > 0 && (
                 <div className="mt-2">
                   <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
                   <ul>
                     {(formTarea.evidencias || []).map((file, index) => (
                       <li key={index} className="text-sm text-gray-600 flex justify-between items-center">
                         {file.name}
                         <CustomButton size="sm" variant="destructive" onClick={() => handleRemoveEvidencia(index)}>Remover</CustomButton>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
            </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <CustomButton variant="outline" onClick={onClose}>Cancelar</CustomButton>
          <CustomButton onClick={handleSave}>Guardar Tarea</CustomButton>
        </div>
      </div>
    </div>
  );
} 