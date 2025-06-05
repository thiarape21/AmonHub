"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import Select from 'react-select';

interface FodaElement {
  id: string;
  texto: string;
  tipo: 'fortaleza' | 'oportunidad' | 'debilidad' | 'amenaza';
  dimension: string; // Para agrupar por contenido temático
  asociado?: string;
}

interface Objetivo {
  id?: string;
  nombre: string;
  descripcion: string;
  elementosFoda: {
    mantener: FodaElement[]; // Fortalezas a mantener
    explotar: FodaElement[]; // Oportunidades a explotar
    corregir: FodaElement[]; // Debilidades a corregir
    afrontar: FodaElement[]; // Amenazas a afrontar
  };
  responsable?: string;
  colaboradores?: string;
  planesOperativos?: PlanOperativo[];
  associatedMetas?: Meta[]; // New property for directly associated metas
}

interface PlanOperativo {
  id?: string;
  nombre: string;
  descripcion: string;
  elementosFoda: {
    mantener: FodaElement[];
    explotar: FodaElement[];
    corregir: FodaElement[];
    afrontar: FodaElement[];
  };
  responsable?: string;
  colaboradores?: string;
  metas: Meta[];
  anio: number;
}

interface Meta {
  id?: string;             // int8 en Supabase
  objetivo_id: number;    // Relación al objetivo
  nombre: string;         // Descripción o título de la meta
  completado: boolean;    // Supabase usa int2 pero aquí se convierte en boolean
}


interface Tarea {
  id?: string;
  nombre: string;
  cumplida: boolean;
}

async function createObjetivo(objetivo: Omit<Objetivo, "id">): Promise<void> {
  try {
    const res = await fetch("http://localhost:3030/api/objetivos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objetivo),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al crear el objetivo");
    }
  } catch (error) {
    console.error("Error creating objetivo:", error);
  }
}

async function updateObjetivo(id: string, objetivo: Omit<Objetivo, "id">): Promise<void> {
  try {
    const res = await fetch(`http://localhost:3030/api/objetivos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objetivo),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al actualizar el objetivo");
    }
  } catch (error) {
    console.error("Error updating objetivo:", error);
  }
}

async function deleteObjetivo(id: string): Promise<void> {
  try {
    const res = await fetch(`http://localhost:3030/api/objetivos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al eliminar el objetivo");
    }
  } catch (error) {
    console.error("Error deleting objetivo:", error);
  }
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [fodaElements, setFodaElements] = useState<FodaElement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editObjetivo, setEditObjetivo] = useState<Objetivo | null>(null);
  const [editPlanOperativo, setEditPlanOperativo] = useState<PlanOperativo | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [elementosFoda, setElementosFoda] = useState<Objetivo['elementosFoda']>({
    mantener: [],
    explotar: [],
    corregir: [],
    afrontar: []
  });
  const [responsable, setResponsable] = useState("");
  const [colaboradores, setColaboradores] = useState("");
  const [usuarios, setUsuarios] = useState<{ id: string; full_name: string }[]>([]);
  const [newAssociatedMetaDescription, setNewAssociatedMetaDescription] = useState('');
  const [formAssociatedMetas, setFormAssociatedMetas] = useState<Meta[]>([]);

  // Derive all available metas from loaded objectives for the select options
  const allAvailableMetas = objetivos.flatMap(obj => (obj.planesOperativos || []).flatMap(po => po.metas || []));
  // Ensure uniqueness of metas if necessary, though react-select handles duplicate values based on 'value'
  const availableMetaOptions = allAvailableMetas.map(meta => ({ value: meta.id, label: meta.nombre }));
async function fetchData() {
  try {
    // 1. Fetch objetivos
    const objetivosRes = await fetch("http://localhost:3030/api/objetivos", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!objetivosRes.ok) {
      throw new Error(`Error fetching objetivos: ${objetivosRes.statusText}`);
    }

    const objetivosData = await objetivosRes.json();
    if (Array.isArray(objetivosData)) {
      setObjetivos(objetivosData);
    } else {
      throw new Error("API returned non-array data for objetivos");
    }
  } catch (error) {
    console.error("Error fetching objetivos:", error);
  }

  try {
    // 2. Fetch FODA elements
    const fodaRes = await fetch("http://localhost:3030/api/analisis-foda", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!fodaRes.ok) {
      throw new Error(`Error fetching FODA elements: ${fodaRes.statusText}`);
    }

    const fodaData = await fodaRes.json();
    if (Array.isArray(fodaData)) {
      setFodaElements(fodaData);
    } else {
      throw new Error("API returned non-array data for FODA elements");
    }
  } catch (error) {
    console.error("Error fetching FODA elements:", error);
  }

  try {
    // 3. Fetch usuarios
    const usersRes = await fetch("http://localhost:3030/api/usuarios", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!usersRes.ok) {
      throw new Error(`Error fetching usuarios: ${usersRes.statusText}`);
    }

    const usersData = await usersRes.json();
    if (Array.isArray(usersData)) {
      setUsuarios(usersData);
    } else {
      throw new Error("API returned non-array data for usuarios");
    }
  } catch (error) {
    console.error("Error fetching usuarios:", error);
  }

  try {
    // 4. Fetch metas asociadas (tabla "meta")
    const metasRes = await fetch("http://localhost:3030/api/metas", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!metasRes.ok) {
      throw new Error(`Error fetching metas: ${metasRes.statusText}`);
    }

    const metasData = await metasRes.json();
    if (Array.isArray(metasData)) {
      setFormAssociatedMetas(metasData); // Cargar metas asociadas al formulario
    } else {
      throw new Error("API returned non-array data for metas");
    }
  } catch (error) {
    console.error("Error fetching metas:", error);
  }
}


  // === Effect Hook for Initial Data Fetching ===
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this effect runs only once on mount


  // Options for react-select dropdowns, filtered by type
  const fortalezaOptions = fodaElements
    .filter(f => f.tipo === 'fortaleza')
    .map(f => ({ value: f.id, label: f.texto }));

  const oportunidadOptions = fodaElements
    .filter(f => f.tipo === 'oportunidad')
    .map(f => ({ value: f.id, label: f.texto }));

  const debilidadOptions = fodaElements
    .filter(f => f.tipo === 'debilidad')
    .map(f => ({ value: f.id, label: f.texto }));

  const amenazaOptions = fodaElements
    .filter(f => f.tipo === 'amenaza')
    .map(f => ({ value: f.id, label: f.texto }));

  const resetForm = () => {
  setEditObjetivo(null);
  setEditPlanOperativo(null);
  setNombre("");
  setDescripcion("");
  setElementosFoda({ mantener: [], explotar: [], corregir: [], afrontar: [] });
  setResponsable("");
  setColaboradores("");
  setFormAssociatedMetas([]); // Reset metas asociadas
};

const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();

  const baseObjetivo = {
    nombre,
    descripcion,
    elementosFoda,
    responsable,
    colaboradores,
  };

  if (editObjetivo) {
    const updatedObjetivo = {
      ...editObjetivo,
      ...baseObjetivo
    };
    await updateObjetivo(editObjetivo.id!, updatedObjetivo);
  } else {
    const nuevoObjetivo: Omit<Objetivo, "id"> = {
      ...baseObjetivo,
      planesOperativos: [],
      associatedMetas: formAssociatedMetas
    };
    await createObjetivo(nuevoObjetivo);
  }

  fetchData();
  setShowForm(false);
  resetForm();
};

const handleEdit = (objetivo: Objetivo) => {
  setEditObjetivo(objetivo);
  setNombre(objetivo.nombre);
  setDescripcion(objetivo.descripcion);
  setElementosFoda({
    mantener: objetivo.elementosFoda?.mantener || [],
    explotar: objetivo.elementosFoda?.explotar || [],
    corregir: objetivo.elementosFoda?.corregir || [],
    afrontar: objetivo.elementosFoda?.afrontar || [],
  });
  setResponsable(objetivo.responsable || "");
  setColaboradores(objetivo.colaboradores || "");
  setFormAssociatedMetas(objetivo.associatedMetas || []);
  setShowForm(true);
};

const handleDelete = async (id?: string) => {
  if (!id) return;
  if (!confirm("¿Seguro que deseas eliminar este objetivo?")) return;
  try {
    await deleteObjetivo(id);
    await fetchData();
  } catch (error) {
    console.error("Error deleting objetivo:", error);
  }
};
const handleAddAssociatedMeta = () => {
  if (newAssociatedMetaDescription.trim()) {
    const newMeta: Meta = {
      id: `temp-${Date.now()}`,
      objetivo_id: editObjetivo?.id ? Number(editObjetivo.id) : -1,
      nombre: newAssociatedMetaDescription.trim(),
      completado: false
    };

    if (editObjetivo) {
      setEditObjetivo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          associatedMetas: [...(prev.associatedMetas || []), newMeta]
        };
      });
    } else {
      setFormAssociatedMetas(prev => [...prev, newMeta]);
    }

    setNewAssociatedMetaDescription('');
  }
};

const handleAssociatedMetaCompletionToggle = (metaId: string) => {
  if (editObjetivo) {
    setEditObjetivo(prev => {
      if (!prev) return null;
      const updated = (prev.associatedMetas || []).map(meta =>
        meta.id === metaId ? { ...meta, completado: !meta.completado } : meta
      );
      return { ...prev, associatedMetas: updated };
    });
  } else {
    setFormAssociatedMetas(prev =>
      prev.map(meta =>
        meta.id === metaId ? { ...meta, completado: !meta.completado } : meta
      )
    );
  }
};



  return (
  <div className="container mx-auto py-8">
    <h1 className="text-4xl font-bold text-center mb-6 text-[#546b70]">OBJETIVOS ESTRATÉGICOS</h1>

    <div className="flex justify-end mb-4">
      <CustomButton onClick={() => {
        setShowForm(true);
        resetForm();
      }}>
        Agregar Objetivo Estratégico
      </CustomButton>
    </div>

    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white border-collapse">
        <thead>
          <tr className="bg-[#4A6670] text-white">
            <th className="border py-2 px-4 text-left">Nombre</th>
            <th className="border py-2 px-4 text-left">Descripción</th>
            <th className="border py-2 px-4 text-left">Metas (Cumplidas/Totales)</th>
            <th className="border py-2 px-4 text-left">FODA Asociado</th>
            <th className="border py-2 px-4 text-left">Responsable</th>
            <th className="border py-2 px-4 text-left">Colaboradores</th>
            <th className="border py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {objetivos.length === 0 ? (
            <tr>
              <td colSpan={7} className="border py-2 px-4 text-center text-gray-500 italic">
                No hay objetivos estratégicos registrados.
              </td>
            </tr>
          ) : (
            objetivos.map((objetivo) => {
              const metas = objetivo.associatedMetas || [];
              const total = metas.length;
              const cumplidas = metas.filter(m => m.completado).length;
              const foda = objetivo.elementosFoda || { mantener: [], explotar: [], corregir: [], afrontar: [] };

              return (
                <tr key={objetivo.id} className="hover:bg-gray-100">
                  <td className="border py-2 px-4 font-medium">{objetivo.nombre}</td>
                  <td className="border py-2 px-4 text-sm">{objetivo.descripcion}</td>
                  <td className="border py-2 px-4 text-sm">{cumplidas}/{total}</td>
                  <td className="border py-2 px-4 text-sm">
                    {foda.mantener?.length > 0 && <div><strong>Mantener:</strong> {foda.mantener.map(e => e.texto).join(", ")}</div>}
                    {foda.explotar?.length > 0 && <div><strong>Explotar:</strong> {foda.explotar.map(e => e.texto).join(", ")}</div>}
                    {foda.corregir?.length > 0 && <div><strong>Corregir:</strong> {foda.corregir.map(e => e.texto).join(", ")}</div>}
                    {foda.afrontar?.length > 0 && <div><strong>Afrontar:</strong> {foda.afrontar.map(e => e.texto).join(", ")}</div>}
                    {(foda.mantener.length + foda.explotar.length + foda.corregir.length + foda.afrontar.length) === 0 && "-N/A-"}
                  </td>
                  <td className="border py-2 px-4 text-sm">{objetivo.responsable || "N/A"}</td>
                  <td className="border py-2 px-4 text-sm">{objetivo.colaboradores || "N/A"}</td>
                  <td className="border py-2 px-4 text-sm">
                    <CustomButton variant="outline" size="sm" onClick={() => handleEdit(objetivo)} className="mr-2">Editar</CustomButton>
                    <CustomButton variant="destructive" size="sm" onClick={() => handleDelete(objetivo.id)}>Eliminar</CustomButton>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    {/* Formulario de Objetivo con metas actualizadas */}
    {showForm && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
        <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold mb-4">{editObjetivo ? "Editar Objetivo Estratégico" : "Crear Objetivo Estratégico"}</h2>

          <input className="w-full border p-2 rounded mb-4" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <textarea className="w-full border p-2 rounded mb-4" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />

          {/* Aquí irían los select de FODA (como en tu código anterior) */}

          <div className="mb-4">
            <label className="block font-semibold mb-1">Metas Asociadas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border rounded p-2 flex-1"
                placeholder="Agregar meta asociada..."
                value={newAssociatedMetaDescription}
                onChange={e => setNewAssociatedMetaDescription(e.target.value)}
              />
              <CustomButton type="button" onClick={handleAddAssociatedMeta}>Agregar</CustomButton>
            </div>
            <ul className="list-disc list-inside">
              {(editObjetivo?.associatedMetas ?? formAssociatedMetas ?? []).map((meta, idx) => (
                <li key={meta.id || idx} className="flex gap-2 items-center">
                  <input type="checkbox" checked={meta.completado} onChange={() => handleAssociatedMetaCompletionToggle(meta.id!)} />
                  <span className={meta.completado ? "line-through text-gray-500" : ""}>{meta.nombre}</span>
                </li>
              ))}
              {(editObjetivo?.associatedMetas ?? formAssociatedMetas ?? []).length === 0 && (
                <li className="text-sm text-gray-500">- No hay metas asociadas agregadas -</li>
              )}
            </ul>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</CustomButton>
            <CustomButton type="submit">{editObjetivo ? "Guardar Cambios" : "Crear Objetivo"}</CustomButton>
          </div>
        </form>
      </div>
    )}
  </div>
);


  }
  