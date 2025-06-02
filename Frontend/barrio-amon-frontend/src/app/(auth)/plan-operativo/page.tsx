"use client";
import { useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";

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
  },
  {
    id: "m2",
    descripcion: "Organizar charlas de concientización ambiental",
    objetivos: ["o1", "o2"],
    responsable: "Comité Ambiental",
    fechaLimite: "2024-08-15",
    estado: "En progreso",
  },
  {
    id: "m3",
    descripcion: "Instalar más basureros en espacios públicos",
    objetivos: ["o1"],
    responsable: "Municipalidad",
    fechaLimite: "2024-09-01",
    estado: "Pendiente",
  },
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
  });

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
    setNuevaMeta({ descripcion: "", objetivos: [], responsable: "", fechaLimite: "", estado: "Pendiente" });
  };

  const handleEdit = (meta: Meta) => {
    setEditMeta(meta);
    setNuevaMeta({
      descripcion: meta.descripcion,
      objetivos: meta.objetivos,
      responsable: meta.responsable,
      fechaLimite: meta.fechaLimite,
      estado: meta.estado,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta meta?")) return;
    setMetas(metas.filter(m => m.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">Plan Operativo Anual 2024</h1>
      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => {
          setShowForm(true);
          setEditMeta(null);
          setNuevaMeta({ descripcion: "", objetivos: [], responsable: "", fechaLimite: "", estado: "Pendiente" });
        }}>Agregar Meta</CustomButton>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Metas del Plan Operativo</h2>
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Descripción</th>
              <th className="py-2 px-4 border-b">Objetivos Asociados</th>
              <th className="py-2 px-4 border-b">Responsable</th>
              <th className="py-2 px-4 border-b">Fecha Límite</th>
              <th className="py-2 px-4 border-b">Estado</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {metas.map(meta => (
              <tr key={meta.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{meta.descripcion}</td>
                <td className="py-2 px-4 border-b">
                  {meta.objetivos.map(oid => (
                    <span key={oid} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1">
                      {objetivosEjemplo.find(o => o.id === oid)?.descripcion}
                    </span>
                  ))}
                </td>
                <td className="py-2 px-4 border-b">{meta.responsable}</td>
                <td className="py-2 px-4 border-b">{meta.fechaLimite}</td>
                <td className="py-2 px-4 border-b">{meta.estado}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-500 hover:text-blue-700 mr-2" onClick={() => handleEdit(meta)}>Editar</button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(meta.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal/Formulario */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editMeta ? "Editar Meta" : "Agregar Meta"}
            </h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea
                className="w-full border rounded p-2"
                value={nuevaMeta.descripcion}
                onChange={e => setNuevaMeta({ ...nuevaMeta, descripcion: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Objetivos Asociados</label>
              <select
                className="w-full border rounded p-2"
                multiple
                value={nuevaMeta.objetivos}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setNuevaMeta({ ...nuevaMeta, objetivos: selected });
                }}
                required
              >
                {objetivosEjemplo.map(obj => (
                  <option key={obj.id} value={obj.id}>{obj.descripcion}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">(Puedes seleccionar varios objetivos)</span>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Responsable</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={nuevaMeta.responsable}
                onChange={e => setNuevaMeta({ ...nuevaMeta, responsable: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Fecha Límite</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={nuevaMeta.fechaLimite}
                onChange={e => setNuevaMeta({ ...nuevaMeta, fechaLimite: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Estado</label>
              <select
                className="w-full border rounded p-2"
                value={nuevaMeta.estado}
                onChange={e => setNuevaMeta({ ...nuevaMeta, estado: e.target.value })}
                required
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
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