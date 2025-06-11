"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CustomButton } from "@/components/ui/custom-button";
import ProyectoForm from "@/components/proyectos/ProyectoForm";

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
  tareas?: Array<Record<string, unknown>>;
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
  const searchParams = useSearchParams();
  const { id } = params;
  const isEditing = searchParams.get('edit') === '1';

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [objetivosSmart, setObjetivosSmart] = useState<ObjetivoSmart[]>([]);

  useEffect(() => {
    if (!id) return;

    // Fetch data based on mode
    if (isEditing) {
      // Fetch all data needed for editing
      fetch(`https://amonhub.onrender.com/api/proyectos/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProyecto(data);
          // Aquí también deberías cargar tareas y pdfs si tu API los devuelve con el proyecto principal
        });
       // También podrías necesitar fetchear objetivos y usuarios aquí si ProyectoForm los necesita
       // ... fetch objetivos ...
       // ... fetch usuarios ...

    } else {
      // Fetch data needed for detail view
      fetch(`https://amonhub.onrender.com/api/proyectos/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProyecto(data);
          if (data?.objetivo_id) {
            fetch(`https://amonhub.onrender.com/api/objetivos`)
              .then((res) => res.json())
              .then((objetivos) => {
                if (Array.isArray(objetivos)) {
                  const obj = objetivos.find((o: Objetivo) => o.id === data.objetivo_id);
                  setObjetivo(obj || null);
                }
              });
          }
        });

      // Fetch SMART objectives for detail view
      fetch(`https://amonhub.onrender.com/api/proyectos/${id}/objetivos-smart`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setObjetivosSmart(data);
          }
        });
    }
  }, [id, isEditing]); // Dependencia de isEditing para re-ejecutar el efecto al cambiar el modo

  if (!proyecto) return <div className="p-8 text-center">Cargando...</div>;

  // Renderizar el formulario de edición si está en modo edición
  if (isEditing) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">Editar Proyecto</h1>
        <ProyectoForm
          modo="editar"
          proyecto={proyecto} // Pasa el objeto proyecto directamente
          onCancel={() => router.push(`/proyectos/${id}`)} // Volver a la vista de detalle
          onSave={() => router.push("/proyectos/lista")} // Volver a la lista después de guardar
        />
      </div>
    );
  }

  // Renderizar la vista de detalle si no está en modo edición
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