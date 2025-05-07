"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CustomButton } from "@/components/ui/custom-button";

interface Proyecto {
  id?: string;
  nombre: string;
  descripcion: string;
  objetivo_id?: string;
  responsable: string;
  colaboradores: string;
  estado_avance: string;
  fecha_inicio: string;
  fecha_fin: string;
  evidencias?: string;
  alertas?: string;
  tareas?: any[];
  objetivosSmart?: ObjetivoSmart[];
  pdfs?: { name: string; url?: string }[];
}

interface Objetivo {
  id: string;
  nombre: string;
  descripcion: string;
}

interface ObjetivoSmart {
  nombre: string;
  descripcion: string;
  cumplida: boolean;
}

export default function ProyectoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3030/api/proyectos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProyecto(data);
        if (data?.objetivo_id) {
          fetch(`http://localhost:3030/api/objetivos`)
            .then((res) => res.json())
            .then((objetivos) => {
              if (Array.isArray(objetivos)) {
                const obj = objetivos.find((o: Objetivo) => o.id === data.objetivo_id);
                setObjetivo(obj || null);
              }
            });
        }
      });
  }, [id]);

  if (!proyecto) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">Detalle del Proyecto</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <span className="font-semibold">Nombre:</span> {proyecto.nombre}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Descripción:</span> {proyecto.descripcion}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Objetivo Estratégico:</span> {objetivo ? objetivo.nombre : <span className="text-gray-400 italic">Sin objetivo</span>}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Responsable:</span> {proyecto.responsable}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Colaboradores:</span> {proyecto.colaboradores}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Estado de avance:</span> {proyecto.estado_avance}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Fecha de inicio:</span> {proyecto.fecha_inicio}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Fecha de fin:</span> {proyecto.fecha_fin}
        </div>
        {/* Objetivos SMART */}
        {proyecto.objetivosSmart && proyecto.objetivosSmart.length > 0 && (
          <div className="mb-4">
            <span className="font-semibold">Objetivos Específicos (SMART):</span>
            <ul className="list-disc ml-6 mt-2">
              {proyecto.objetivosSmart.map((o, idx) => (
                <li key={idx} className="mb-1">
                  <span className={o.cumplida ? "line-through" : ""}>
                    <strong>{o.nombre}</strong>: {o.descripcion}
                  </span>
                  {o.cumplida && <span className="ml-2 text-green-600">✔ Cumplido</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* PDFs */}
        {proyecto.pdfs && proyecto.pdfs.length > 0 && (
          <div className="mb-4">
            <span className="font-semibold">Evidencias (PDFs):</span>
            <ul className="list-disc ml-6 mt-2">
              {proyecto.pdfs.map((file, idx) => (
                <li key={idx}>
                  {file.url ? (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{file.name}</a>
                  ) : (
                    <span>{file.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Ejemplo de datos para backend */}
        <div className="mb-4 bg-gray-100 p-4 rounded">
          <span className="font-semibold block mb-2">Ejemplo de datos JSON esperado para el backend:</span>
          <pre className="text-xs overflow-x-auto bg-gray-200 p-2 rounded">
{`
{
  "id": "123",
  "nombre": "Mejoramiento de Espacios Públicos",
  "descripcion": "Proyecto para renovar parques y aceras del barrio.",
  "objetivo_id": "obj-estrategico-1",
  "responsable": "Juan Pérez",
  "colaboradores": "María García, Carlos López",
  "estado_avance": "En proceso",
  "fecha_inicio": "2024-06-01",
  "fecha_fin": "2024-12-31",
  "objetivosSmart": [
    {
      "nombre": "Renovar 2 parques principales",
      "descripcion": "Completar la renovación de los parques Central y Norte antes de noviembre.",
      "cumplida": false
    },
    {
      "nombre": "Mejorar accesibilidad en aceras",
      "descripcion": "Reparar y adaptar 500 metros de aceras para accesibilidad universal.",
      "cumplida": true
    }
  ],
  "pdfs": [
    {
      "name": "diagnostico-inicial.pdf",
      "url": "https://servidor.com/uploads/diagnostico-inicial.pdf"
    },
    {
      "name": "planos-renovacion.pdf",
      "url": "https://servidor.com/uploads/planos-renovacion.pdf"
    }
  ]
}
`}
          </pre>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <CustomButton type="button" variant="outline" onClick={() => router.push("/proyectos/lista")}>Atrás</CustomButton>
        </div>
      </div>
    </div>
  );
} 