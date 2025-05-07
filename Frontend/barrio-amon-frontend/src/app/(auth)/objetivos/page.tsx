// Adaptación de conexiones M:N entre Objetivos y FODA en el frontend

"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";

interface FodaElement {
  id: string;
  texto: string;
  tipo: "fortaleza" | "oportunidad" | "debilidad" | "amenaza";
  dimension: string;
}

interface Objetivo {
  id?: string;
  nombre: string;
  descripcion: string;
  responsable?: string;
  colaboradores?: string;
  fodaRelacion?: FodaElement[]; // relación N:N con FODA
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [elementosFodaDisponibles, setElementosFodaDisponibles] = useState<FodaElement[]>([]);
  const [selectedFodaIds, setSelectedFodaIds] = useState<string[]>([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsable, setResponsable] = useState("");
  const [colaboradores, setColaboradores] = useState("");

  useEffect(() => {
    fetch("http://localhost:3030/api/objetivos-foda")
      .then((res) => res.json())
      .then((data) => setObjetivos(data))
      .catch((err) => console.error("Error cargando objetivos:", err));

    fetch("http://localhost:3030/api/analisis-foda")
      .then((res) => res.json())
      .then((data) => setElementosFodaDisponibles(data))
      .catch((err) => console.error("Error cargando FODA:", err));
  }, []);

  const handleCrearObjetivo = async () => {
    const res = await fetch("http://localhost:3030/api/objetivos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, responsable, colaboradores })
    });

    if (!res.ok) return alert("Error al crear objetivo");
    const nuevoObjetivo = await res.json();

    // Relacionar con FODA seleccionados
    if (selectedFodaIds.length > 0) {
      await fetch("http://localhost:3030/api/objetivos-foda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objetivo_id: nuevoObjetivo.id,
          foda_ids: selectedFodaIds,
        })
      });
    }

    setNombre("");
    setDescripcion("");
    setResponsable("");
    setColaboradores("");
    setSelectedFodaIds([]);

    // Recargar lista
    const recarga = await fetch("http://localhost:3030/api/objetivos-foda");
    const data = await recarga.json();
    setObjetivos(data);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Objetivos Estratégicos</h1>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Crear Objetivo</h2>
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Nombre del objetivo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <textarea
          className="border rounded p-2 w-full mb-2"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
        />
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Colaboradores"
          value={colaboradores}
          onChange={(e) => setColaboradores(e.target.value)}
        />

        <label className="block font-semibold mb-1">Seleccionar elementos FODA:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
          {elementosFodaDisponibles.map((foda) => (
            <label key={foda.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFodaIds.includes(foda.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFodaIds([...selectedFodaIds, foda.id]);
                  } else {
                    setSelectedFodaIds(selectedFodaIds.filter((id) => id !== foda.id));
                  }
                }}
              />
              <span>{foda.texto}</span>
            </label>
          ))}
        </div>

        <CustomButton onClick={handleCrearObjetivo} className="mt-4">
          Crear Objetivo
        </CustomButton>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Lista de Objetivos</h2>
        <ul className="space-y-4">
          {objetivos.map((obj) => (
            <li key={obj.id} className="p-4 border rounded shadow">
              <h3 className="text-lg font-bold">{obj.nombre}</h3>
              <p>{obj.descripcion}</p>
              <p className="text-sm text-gray-600">Responsable: {obj.responsable}</p>
              <p className="text-sm text-gray-600">Colaboradores: {obj.colaboradores}</p>
              <div className="mt-2">
                <strong>Elementos FODA:</strong>
                <ul className="list-disc list-inside">
                  {obj.fodaRelacion?.map((foda) => (
                    <li key={foda.id}>{foda.texto} ({foda.tipo})</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
