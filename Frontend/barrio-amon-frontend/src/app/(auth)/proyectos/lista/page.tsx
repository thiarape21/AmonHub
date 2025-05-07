"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomButton } from "@/components/ui/custom-button";
import type { Proyecto } from "@/components/proyectos/ProyectoForm";

interface Objetivo {
  id: string;
  nombre: string;
}

export default function ProyectosListaPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3030/api/proyectos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProyectos(data);
        } else {
          setProyectos([]);
          console.error("Error al obtener proyectos:", data?.error || data);
        }
      });
    fetch("http://localhost:3030/api/objetivos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    await fetch(`http://localhost:3030/api/proyectos/${id}`, { method: "DELETE" });
    setProyectos(proyectos.filter((p) => p.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">PROYECTOS</h1>
      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => router.push("/proyectos/nuevo")}>Crear Proyecto</CustomButton>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-[#4A6670] text-white">
            <tr>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Objetivo</th>
              <th className="py-2 px-4">Responsable</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((proyecto) => {
              const objetivo = objetivos.find(o => o.id === proyecto.objetivo_id);
              return (
                <tr key={proyecto.id} className="border-b">
                  <td className="py-2 px-4">{proyecto.nombre}</td>
                  <td className="py-2 px-4">{objetivo ? objetivo.nombre : <span className="text-gray-400 italic">Sin objetivo</span>}</td>
                  <td className="py-2 px-4">{proyecto.responsable}</td>
                  <td className="py-2 px-4">{proyecto.estado_avance}</td>
                  <td className="py-2 px-4 space-x-2">
                    <CustomButton size="sm" variant="outline" onClick={() => router.push(`/proyectos/${proyecto.id as string}`)}>Ver</CustomButton>
                    <CustomButton size="sm" variant="outline" onClick={() => router.push(`/proyectos/${proyecto.id as string}?edit=1`)}>Editar</CustomButton>
                    <CustomButton size="sm" variant="destructive" onClick={() => handleDelete(proyecto.id as string)}>Eliminar</CustomButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 