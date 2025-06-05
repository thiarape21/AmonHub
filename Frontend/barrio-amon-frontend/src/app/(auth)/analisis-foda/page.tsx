"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";

interface FodaElement {
  id: string;
  texto: string;
  tipo: 'fortaleza' | 'oportunidad' | 'debilidad' | 'amenaza';
  dimension: string;
}

// === Funciones para interactuar con API ===

async function getFoda(): Promise<FodaElement[]> {
  const res = await fetch("http://localhost:3030/api/analisis-foda", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudieron obtener los elementos FODA");
  return res.json();
}

async function createFoda(elemento: Omit<FodaElement, "id">): Promise<void> {
  const res = await fetch("http://localhost:3030/api/analisis-foda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(elemento),
  });
  if (!res.ok) throw new Error("Error al crear el elemento FODA");
}

async function updateFoda(id: string, elemento: Omit<FodaElement, "id">): Promise<void> {
  const res = await fetch(`http://localhost:3030/api/analisis-foda/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(elemento),
  });
  if (!res.ok) throw new Error("Error al actualizar el elemento FODA");
}

async function deleteFoda(id: string): Promise<void> {
  const res = await fetch(`http://localhost:3030/api/analisis-foda/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el elemento FODA");
}

// === Dimensiones base por defecto ===
const dimensionesBase = [
  "Patrimonio", "Ubicación", "Comunidad", "Recursos", "Turismo",
  "Inversión", "Infraestructura", "Espacios Públicos", "Gestión", "Desarrollo", "Clima"
];

// === Componente principal ===
export default function FodaPage() {
  const [elementos, setElementos] = useState<FodaElement[]>([]);
  const [dimensiones, setDimensiones] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editElemento, setEditElemento] = useState<FodaElement | null>(null);
  const [nuevoElemento, setNuevoElemento] = useState<Partial<FodaElement>>({
    texto: "",
    tipo: "fortaleza",
    dimension: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFoda();
        setElementos(data);
      } catch (error) {
        console.error("Error al cargar análisis FODA:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const dinamicas = elementos.map(e => e.dimension);
    const dims = [...new Set([...dimensionesBase, ...dinamicas])];
    setDimensiones(dims);
  }, [elementos]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoElemento.texto || !nuevoElemento.tipo || !nuevoElemento.dimension) return;

    try {
      const elemento = {
        texto: nuevoElemento.texto!,
        tipo: nuevoElemento.tipo as FodaElement['tipo'],
        dimension: nuevoElemento.dimension!,
      };

      if (editElemento) {
        await updateFoda(editElemento.id, elemento);
      } else {
        await createFoda(elemento);
      }

      const updated = await getFoda();
      setElementos(updated);
      setShowForm(false);
      setEditElemento(null);
      setNuevoElemento({ texto: "", tipo: "fortaleza", dimension: "" });
    } catch (err) {
      console.error("Error al guardar elemento FODA:", err);
    }
  };

  const handleEdit = (elemento: FodaElement) => {
    setEditElemento(elemento);
    setNuevoElemento({
      texto: elemento.texto,
      tipo: elemento.tipo,
      dimension: elemento.dimension,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este elemento?")) return;
    try {
      await deleteFoda(id);
      const updated = await getFoda();
      setElementos(updated);
    } catch (err) {
      console.error("Error al eliminar elemento FODA:", err);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">ANÁLISIS FODA</h1>
      
      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => {
          setShowForm(true);
          setEditElemento(null);
          setNuevoElemento({ texto: "", tipo: "fortaleza", dimension: "" });
        }}>Agregar Elemento FODA</CustomButton>
      </div>

      {/* Dimensiones */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dimensiones Identificadas</h2>
        <div className="flex flex-wrap gap-2">
          {dimensiones.map(dim => (
            <span key={dim} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {dim}
            </span>
          ))}
        </div>
      </div>
x
      {/* Matriz FODA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {["fortaleza", "oportunidad", "debilidad", "amenaza"].map(tipo => {
          const colores: Record<string, string> = {
            fortaleza: "green", oportunidad: "blue", debilidad: "yellow", amenaza: "red"
          };
          return (
            <div key={tipo} className={`bg-${colores[tipo]}-50 p-4 rounded-lg`}>
              <h2 className={`text-xl font-bold mb-4 text-${colores[tipo]}-800`}>
                {tipo[0].toUpperCase() + tipo.slice(1)}
              </h2>
              <ul className="space-y-2">
                {elementos.filter(e => e.tipo === tipo).map(e => (
                  <li key={e.id} className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{e.texto}</p>
                        <p className="text-sm text-gray-600">Dimensión: {e.dimension}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(e)} className="text-blue-500 hover:text-blue-700">Editar</button>
                        <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">Eliminar</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Modal/Formulario */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editElemento ? "Editar Elemento FODA" : "Agregar Elemento FODA"}
            </h2>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Tipo</label>
              <select
                className="w-full border rounded p-2"
                value={nuevoElemento.tipo}
                onChange={e => setNuevoElemento({...nuevoElemento, tipo: e.target.value as FodaElement['tipo']})}
                required
              >
                <option value="fortaleza">Fortaleza</option>
                <option value="oportunidad">Oportunidad</option>
                <option value="debilidad">Debilidad</option>
                <option value="amenaza">Amenaza</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Dimensión</label>
              <select
                className="w-full border rounded p-2"
                value={nuevoElemento.dimension}
                onChange={e => setNuevoElemento({...nuevoElemento, dimension: e.target.value})}
                required
              >
                <option value="">Seleccionar dimensión...</option>
                {dimensiones.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea
                className="w-full border rounded p-2"
                value={nuevoElemento.texto}
                onChange={e => setNuevoElemento({...nuevoElemento, texto: e.target.value})}
                required
              />
            </div>

            
            <div className="flex justify-end gap-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </CustomButton>
              <CustomButton type="submit">
                {editElemento ? "Guardar cambios" : "Agregar"}
              </CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
