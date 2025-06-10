"use client";
import { useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";

interface FodaElement {
  id: string;
  texto: string;
  tipo: 'fortaleza' | 'oportunidad' | 'debilidad' | 'amenaza';
  dimension: string;
  meca?: 'mantener' | 'explotar' | 'corregir' | 'afrontar';
}

// Datos de ejemplo que vendrían de la API
const elementosFodaEjemplo: FodaElement[] = [
  // Fortalezas
  {
    id: "f1",
    texto: "Patrimonio histórico bien conservado",
    tipo: "fortaleza",
    dimension: "Patrimonio"
  },
  {
    id: "f2",
    texto: "Ubicación céntrica y accesible",
    tipo: "fortaleza",
    dimension: "Ubicación"
  },
  {
    id: "f3",
    texto: "Comunidad organizada y participativa",
    tipo: "fortaleza",
    dimension: "Comunidad"
  },
  {
    id: "f4",
    texto: "Recursos municipales disponibles",
    tipo: "fortaleza",
    dimension: "Recursos"
  },

  // Oportunidades
  {
    id: "o1",
    texto: "Potencial turístico cultural",
    tipo: "oportunidad",
    dimension: "Turismo"
  },
  {
    id: "o2",
    texto: "Fondos de desarrollo urbano disponibles",
    tipo: "oportunidad",
    dimension: "Recursos"
  },
  {
    id: "o3",
    texto: "Interés de inversores en el área",
    tipo: "oportunidad",
    dimension: "Inversión"
  },
  {
    id: "o4",
    texto: "Programas de conservación patrimonial",
    tipo: "oportunidad",
    dimension: "Patrimonio"
  },

  // Debilidades
  {
    id: "d1",
    texto: "Infraestructura envejecida",
    tipo: "debilidad",
    dimension: "Infraestructura"
  },
  {
    id: "d2",
    texto: "Falta de espacios verdes",
    tipo: "debilidad",
    dimension: "Espacios Públicos"
  },
  {
    id: "d3",
    texto: "Limitaciones presupuestarias",
    tipo: "debilidad",
    dimension: "Recursos"
  },
  {
    id: "d4",
    texto: "Procesos burocráticos lentos",
    tipo: "debilidad",
    dimension: "Gestión"
  },

  // Amenazas
  {
    id: "a1",
    texto: "Gentrificación del barrio",
    tipo: "amenaza",
    dimension: "Desarrollo"
  },
  {
    id: "a2",
    texto: "Cambio climático y eventos extremos",
    tipo: "amenaza",
    dimension: "Clima"
  },
  {
    id: "a3",
    texto: "Cambios en políticas municipales",
    tipo: "amenaza",
    dimension: "Gestión"
  },
  {
    id: "a4",
    texto: "Competencia de otros barrios históricos",
    tipo: "amenaza",
    dimension: "Turismo"
  }
];

// Estado inicial de dimensiones (catálogo editable, datos en duro)
const dimensionesEjemplo = [
  "Patrimonio",
  "Ubicación",
  "Comunidad",
  "Recursos",
  "Turismo",
  "Inversión",
  "Infraestructura",
  "Espacios Públicos",
  "Gestión",
  "Desarrollo",
  "Clima"
];

export default function FodaPage() {
  const [elementos, setElementos] = useState<FodaElement[]>(elementosFodaEjemplo);
  const [dimensiones, setDimensiones] = useState<string[]>(dimensionesEjemplo);
  const [showForm, setShowForm] = useState(false);
  const [editElemento, setEditElemento] = useState<FodaElement | null>(null);
  const [nuevoElemento, setNuevoElemento] = useState<Partial<FodaElement>>({
    texto: "",
    tipo: "fortaleza",
    dimension: ""
  });
  const [nuevaDimension, setNuevaDimension] = useState("");

  // Eliminar dimensión del catálogo y de los elementos FODA
  const handleEliminarDimension = (dim: string) => {
    if (!confirm(`¿Seguro que deseas eliminar la dimensión "${dim}"? Esto eliminará los elementos FODA asociados.`)) return;
    setDimensiones(dimensiones.filter(d => d !== dim));
    setElementos(elementos.filter(e => e.dimension !== dim));
  };

  // Agregar nueva dimensión al catálogo
  const handleAgregarDimension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDimension.trim() || dimensiones.includes(nuevaDimension.trim())) return;
    setDimensiones([...dimensiones, nuevaDimension.trim()]);
    setNuevaDimension("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoElemento.texto || !nuevoElemento.tipo || !nuevoElemento.dimension) return;

    if (editElemento) {
      setElementos(elementos.map(e => 
        e.id === editElemento.id 
          ? { ...e, ...nuevoElemento, id: e.id }
          : e
      ));
    } else {
      setElementos([...elementos, {
        id: `${nuevoElemento.tipo[0]}${elementos.length + 1}`,
        texto: nuevoElemento.texto,
        tipo: nuevoElemento.tipo as FodaElement['tipo'],
        dimension: nuevoElemento.dimension
      }]);
    }

    setShowForm(false);
    setEditElemento(null);
    setNuevoElemento({ texto: "", tipo: "fortaleza", dimension: "" });
  };

  const handleEdit = (elemento: FodaElement) => {
    setEditElemento(elemento);
    setNuevoElemento({
      texto: elemento.texto,
      tipo: elemento.tipo,
      dimension: elemento.dimension
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este elemento?")) return;
    setElementos(elementos.filter(e => e.id !== id));
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

      {/* Dimensiones (Catálogo editable) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Dimensiones Identificadas</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {dimensiones.map(dim => (
            <span key={dim} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
              {dim}
              <button
                className="ml-1 text-red-500 hover:text-red-700 text-xs font-bold"
                title="Eliminar dimensión"
                onClick={() => handleEliminarDimension(dim)}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form className="flex gap-2 items-center" onSubmit={handleAgregarDimension}>
          <input
            type="text"
            className="border rounded p-1 text-sm"
            placeholder="Agregar nueva dimensión..."
            value={nuevaDimension}
            onChange={e => setNuevaDimension(e.target.value)}
          />
          <CustomButton type="submit" size="sm">Agregar</CustomButton>
        </form>
      </div>

      {/* Matriz FODA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fortalezas */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-800">Fortalezas</h2>
          <ul className="space-y-2">
            {elementos
              .filter(e => e.tipo === 'fortaleza')
              .map(e => (
                <li key={e.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{e.texto}</p>
                      <p className="text-sm text-gray-600">Dimensión: {e.dimension}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Oportunidades */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Oportunidades</h2>
          <ul className="space-y-2">
            {elementos
              .filter(e => e.tipo === 'oportunidad')
              .map(e => (
                <li key={e.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{e.texto}</p>
                      <p className="text-sm text-gray-600">Dimensión: {e.dimension}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Debilidades */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">Debilidades</h2>
          <ul className="space-y-2">
            {elementos
              .filter(e => e.tipo === 'debilidad')
              .map(e => (
                <li key={e.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{e.texto}</p>
                      <p className="text-sm text-gray-600">Dimensión: {e.dimension}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Amenazas */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-800">Amenazas</h2>
          <ul className="space-y-2">
            {elementos
              .filter(e => e.tipo === 'amenaza')
              .map(e => (
                <li key={e.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{e.texto}</p>
                      <p className="text-sm text-gray-600">Dimensión: {e.dimension}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
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
                {editElemento ? "Guardar" : "Agregar"}
              </CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 