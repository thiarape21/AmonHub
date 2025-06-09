"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import Select from "react-select";

interface FodaElement {
  id: number;
  texto: string;
  tipo: "fortaleza" | "oportunidad" | "debilidad" | "amenaza";
  dimension: string;
}

interface Meta {
  id?: string;
  objetivo_id: number;
  nombre: string;
  completado: boolean;
}

interface Usuario {
  id: number;
  full_name: string;
}

interface Objetivo {
  id?: string;
  nombre: string;
  descripcion: string;
  responsable_id?: number;
  colaboradores?: string;
  metas_asociadas?: Meta[];
  foda_ids?: number[];
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [fodaElements, setFodaElements] = useState<FodaElement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editObjetivo, setEditObjetivo] = useState<Objetivo | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [elementosFoda, setElementosFoda] = useState({
    mantener: [] as FodaElement[],
    explotar: [] as FodaElement[],
    corregir: [] as FodaElement[],
    afrontar: [] as FodaElement[],
  });
  const [responsableId, setResponsableId] = useState<number | "">("");
  const [colaboradores, setColaboradores] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [newMetaDesc, setNewMetaDesc] = useState("");
  const [formMetas, setFormMetas] = useState<Meta[]>([]);

  useEffect(() => {
    fetchData();
  }, []);
async function fetchData() {
  try {
    const [objetivosRes, fodaRes, usersRes] = await Promise.all([
      fetch("http://localhost:3030/api/objetivos"),
      fetch("http://localhost:3030/api/analisis-foda"),
      fetch("http://localhost:3030/api/usuarios"),
    ]);

    const [objetivosData, fodaData, usersData] = await Promise.all([
      objetivosRes.json(),
      fodaRes.json(),
      usersRes.json(),
    ]);

    console.log("Objetivos recibidos:", objetivosData); // <-- IMPRIME AQUÍ
    console.log("FODA recibidos:", fodaData);
    console.log("Usuarios recibidos:", usersData);

    if (Array.isArray(objetivosData)) setObjetivos(objetivosData);
    if (Array.isArray(fodaData)) setFodaElements(fodaData);
    if (Array.isArray(usersData)) {
      const valid = usersData.filter((u: any): u is Usuario =>
        typeof u.id === "number" && typeof u.full_name === "string"
      );
      setUsuarios(valid);
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}


  const resetForm = () => {
    setEditObjetivo(null);
    setNombre("");
    setDescripcion("");
    setElementosFoda({ mantener: [], explotar: [], corregir: [], afrontar: [] });
    setResponsableId("");
    setColaboradores("");
    setFormMetas([]);
    setNewMetaDesc("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const foda_ids = [
      ...elementosFoda.mantener,
      ...elementosFoda.explotar,
      ...elementosFoda.corregir,
      ...elementosFoda.afrontar,
    ].map((e) => e.id);

    const metas_asociadas = formMetas.map((meta) => ({
      id: meta.id,
      objetivo_id: meta.objetivo_id,
      nombre: meta.nombre,
      completado: meta.completado,
    }));

    const objetivo: Objetivo = {
      nombre,
      descripcion,
      ...(typeof responsableId === "number" ? { responsable_id: responsableId } : {}),
      colaboradores,
      metas_asociadas,
      foda_ids,
    };

    const url = editObjetivo
      ? `http://localhost:3030/api/objetivos/${editObjetivo.id}`
      : "http://localhost:3030/api/objetivos";

    const method = editObjetivo ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objetivo),
    });

    fetchData();
    setShowForm(false);
    resetForm();
  };

const handleEdit = (objetivo: Objetivo) => {
  setEditObjetivo(objetivo);
  setNombre(objetivo.nombre);
  setDescripcion(objetivo.descripcion);

  // Cargar FODA asignado
  setElementosFoda({
    mantener: fodaElements.filter(f => objetivo.foda_ids?.includes(f.id) && f.tipo === "fortaleza"),
    explotar: fodaElements.filter(f => objetivo.foda_ids?.includes(f.id) && f.tipo === "oportunidad"),
    corregir: fodaElements.filter(f => objetivo.foda_ids?.includes(f.id) && f.tipo === "debilidad"),
    afrontar: fodaElements.filter(f => objetivo.foda_ids?.includes(f.id) && f.tipo === "amenaza"),
  });

  setResponsableId(objetivo.responsable_id ?? "");
  setColaboradores(objetivo.colaboradores || "");
  setFormMetas(objetivo.metas_asociadas || []);
  setShowForm(true);
};


  const handleDelete = async (id?: string) => {
    if (!id || !confirm("¿Seguro que deseas eliminar este objetivo?")) return;
    await fetch(`http://localhost:3030/api/objetivos/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddMeta = () => {
    if (!newMetaDesc.trim()) return;
    const nuevaMeta: Meta = {
      id: `temp-${Date.now()}`,
      objetivo_id: editObjetivo?.id ? Number(editObjetivo.id) : -1,
      nombre: newMetaDesc.trim(),
      completado: false,
    };
    setFormMetas((prev) => [...prev, nuevaMeta]);
    setNewMetaDesc("");
  };

  const toggleMeta = (metaId: string) => {
    setFormMetas((prev) =>
      prev.map((meta) => (meta.id === metaId ? { ...meta, completado: !meta.completado } : meta))
    );
  };
return (
  <div className="container mx-auto py-8">
    <h1 className="text-4xl font-bold text-center mb-6 text-[#546b70]">OBJETIVOS ESTRATÉGICOS</h1>

    <div className="flex justify-end mb-4">
      <CustomButton onClick={() => { setShowForm(true); resetForm(); }}>
        Agregar Objetivo Estratégico
      </CustomButton>
    </div>

    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white border-collapse">
        <thead>
          <tr className="bg-[#4A6670] text-white">
            <th className="border py-2 px-4 text-left">Nombre</th>
            <th className="border py-2 px-4 text-left">Descripción</th>
            <th className="border py-2 px-4 text-left">Metas</th>
            <th className="border py-2 px-4 text-left">Responsable</th>
            <th className="border py-2 px-4 text-left">Colaboradores</th>
            <th className="border py-2 px-4 text-left">FODA</th>
            <th className="border py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {objetivos.length === 0 ? (
            <tr>
              <td colSpan={7} className="border py-2 px-4 text-center text-gray-500 italic">
                No hay objetivos registrados.
              </td>
            </tr>
          ) : objetivos.map((objetivo) => {
            const metas = objetivo.metas_asociadas || [];
            const total = metas.length;
            const cumplidas = metas.filter((m) => m.completado).length;
            const responsable = usuarios.find((u) => u.id === objetivo.responsable_id)?.full_name || "N/A";

            const fodaTextos = (objetivo.foda_ids || [])
              .map(id => fodaElements.find(f => f.id === id))
              .filter(Boolean)
              .map(f => `• ${f!.texto}`);

            return (
              <tr key={objetivo.id} className="hover:bg-gray-100">
                <td className="border py-2 px-4">{objetivo.nombre}</td>
                <td className="border py-2 px-4">{objetivo.descripcion}</td>
                <td className="border py-2 px-4">{cumplidas}/{total}</td>
                <td className="border py-2 px-4">{responsable}</td>
                <td className="border py-2 px-4">{objetivo.colaboradores || "N/A"}</td>
                <td className="border py-2 px-4 whitespace-pre-wrap text-sm">
                  {fodaTextos.length > 0 ? fodaTextos.join("\n") : "—"}
                </td>
                <td className="border py-2 px-4 space-x-2">
                  <CustomButton size="sm" onClick={() => handleEdit(objetivo)}>Editar</CustomButton>
                  <CustomButton size="sm" variant="destructive" onClick={() => handleDelete(objetivo.id)}>Eliminar</CustomButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {showForm && (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
        <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-4">{editObjetivo ? "Editar" : "Crear"} Objetivo</h2>

          {/* Nombre */}
          <input
            className="w-full border p-2 rounded mb-4"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />

          {/* Descripción */}
          <textarea
            className="w-full border p-2 rounded mb-4"
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            required
          />

          {/* Responsable */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Responsable</label>
            <select
              className="w-full border p-2 rounded"
              value={responsableId}
              onChange={(e) => setResponsableId(Number(e.target.value))}
              required
            >
              <option value="">-- Selecciona un responsable --</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Colaboradores */}
          <input
            className="w-full border p-2 rounded mb-4"
            placeholder="Colaboradores"
            value={colaboradores}
            onChange={e => setColaboradores(e.target.value)}
          />

          {/* FODA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {["mantener", "explotar", "corregir", "afrontar"].map((categoria) => {
              const labelMap: Record<string, string> = {
                mantener: "Fortalezas a Mantener",
                explotar: "Oportunidades a Explotar",
                corregir: "Debilidades a Corregir",
                afrontar: "Amenazas a Afrontar",
              };
              const tipoMap: Record<string, FodaElement["tipo"]> = {
                mantener: "fortaleza",
                explotar: "oportunidad",
                corregir: "debilidad",
                afrontar: "amenaza",
              };
              const opciones = fodaElements
                .filter((f) => f.tipo === tipoMap[categoria])
                .map((f) => ({ value: f.id, label: f.texto }));
              return (
                <div key={categoria}>
                  <label className="block font-semibold mb-1">{labelMap[categoria]}</label>
                  <Select
                    isMulti
                    options={opciones}
                    value={elementosFoda[categoria as keyof typeof elementosFoda].map((f) => ({
                      value: f.id,
                      label: f.texto,
                    }))}
                    onChange={(selected) => {
                      const seleccionados = (selected as { value: number; label: string }[])
                        .map(opt => fodaElements.find(f => f.id === opt.value)!);
                      setElementosFoda(prev => ({ ...prev, [categoria]: seleccionados }));
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Metas asociadas */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Metas Asociadas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border rounded p-2 flex-1"
                placeholder="Agregar meta..."
                value={newMetaDesc}
                onChange={e => setNewMetaDesc(e.target.value)}
              />
              <CustomButton type="button" onClick={handleAddMeta}>Agregar</CustomButton>
            </div>
            <ul className="list-disc list-inside">
              {formMetas.map((meta, idx) => (
                <li key={meta.id || idx} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={meta.completado}
                    onChange={() => toggleMeta(meta.id!)}
                  />
                  <span className={meta.completado ? "line-through text-gray-500" : ""}>
                    {meta.nombre}
                  </span>
                </li>
              ))}
              {formMetas.length === 0 && (
                <li className="text-sm text-gray-500">- No hay metas asociadas agregadas -</li>
              )}
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </CustomButton>
            <CustomButton type="submit">
              {editObjetivo ? "Guardar Cambios" : "Crear Objetivo"}
            </CustomButton>
          </div>
        </form>
      </div>
    )}
  </div>
);

}
