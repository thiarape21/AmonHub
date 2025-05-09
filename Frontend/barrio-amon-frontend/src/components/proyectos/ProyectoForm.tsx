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

  useEffect(() => {
    fetch("http://localhost:3030/api/objetivos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      });
    fetch("http://localhost:3030/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsuarios(data);
        else setUsuarios([]);
      });
    if (modo === "editar" && proyecto.id) {
      fetch(`http://localhost:3030/api/proyectos/${proyecto.id}/objetivos-smart`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setObjetivosSmart(data);
        });

      fetch(`http://localhost:3030/api/proyectos/${proyecto.id}/pdfs`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Aquí podrías manejar los PDFs existentes si es necesario
          }
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al guardar el proyecto");

      const proyectoGuardado = await res.json();

      if (objetivosSmart.length > 0) {
        const objetivosSmartConProyectoId = objetivosSmart.map(obj => ({
          ...obj,
          proyecto_id: proyectoGuardado.id
        }));

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
        <label className="block font-semibold">Estado de avance</label>
        <select name="estado_avance" value={form.estado_avance} onChange={handleChange} className="w-full border rounded p-2">
          <option value="">Selecciona un estado</option>
          <option value="En proceso">En proceso</option>
          <option value="Completado">Completado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
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
      <div className="flex justify-end gap-2 mt-6">
        <CustomButton type="button" variant="outline" onClick={onCancel}>Atrás</CustomButton>
        <CustomButton type="submit" disabled={loading}>{modo === "crear" ? "Crear" : "Guardar"}</CustomButton>
      </div>
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