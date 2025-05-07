"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CustomButton } from "@/components/ui/custom-button";

interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
  objetivo_id?: number;
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
  id: number;
  nombre: string;
  descripcion: string;
}

interface ObjetivoSmart {
  id?: number;
  nombre: string;
  descripcion: string;
  cumplida: boolean;
  proyecto_id?: number;
}

export default function ProyectoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [objetivosSmart, setObjetivosSmart] = useState<ObjetivoSmart[]>([]);

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

    // Fetch SMART objectives
    fetch(`http://localhost:3030/api/proyectos/${id}/objetivos-smart`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setObjetivosSmart(data);
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
        <div className="mb-4">
          <span className="font-semibold block mb-2">Objetivos Específicos (SMART):</span>
          {objetivosSmart.length > 0 ? (
            <ul className="list-disc ml-6 mt-2">
              {objetivosSmart.map((o, idx) => (
                <li key={idx} className="mb-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={o.cumplida}
                      readOnly
                      className="mt-1"
                    />
                    <div>
                      <span className={o.cumplida ? "line-through" : ""}>
                        <strong>{o.nombre}</strong>
                      </span>
                      <p className="text-gray-600 text-sm">{o.descripcion}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No hay objetivos SMART definidos</p>
          )}
        </div>
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
        <div className="flex justify-end gap-2 mt-6">
          <CustomButton type="button" variant="outline" onClick={() => router.push("/proyectos/lista")}>Atrás</CustomButton>
        </div>
      </div>
    </div>
  );
} 