"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomButton } from "@/components/ui/custom-button";
import type { Proyecto } from "@/components/proyectos/ProyectoForm";
import ProyectoForm from "@/components/proyectos/ProyectoForm";

interface Objetivo {
  id: number;
  nombre: string;
}

// // Utility function to determine project status based on tasks
// function getProjectStatus(Tareas: Proyecto['Tareas']): string {
//   if (!Tareas || Tareas.length === 0) {
//     return "Pendiente";
//   }

//   const totalTasks = Tareas.length;
//   const completedTasks = Tareas.filter(tarea => tarea.estado === 'Completada').length;
//   const canceledTasks = Tareas.filter(tarea => tarea.estado === 'Cancelada').length;
//   const inProgressOrPendingTasks = Tareas.filter(tarea => tarea.estado === 'En proceso' || tarea.estado === 'Pendiente').length;

//   if (canceledTasks === totalTasks) {
//     return "Cancelado";
//   } else if (canceledTasks > 0) {
//      // If some are canceled, and all non-canceled are completed
//      if (completedTasks + canceledTasks === totalTasks) {
//        return "Completada (con cancelaciones)";
//      } else {
//         return "En proceso (con cancelaciones)"; // Or another appropriate mixed status
//      }
//   } else if (completedTasks === totalTasks) {
//     return "Completada";
//   } else if (inProgressOrPendingTasks > 0) {
//     return "En proceso";
//   } else {
//      return "Pendiente"; // Should not reach here if tasks exist but none are in above states
//   }
// }

export default function ProyectosListaPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("https://amonhub.onrender.com/api/proyectos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProyectos(data);
        } else {
          console.error("Error al obtener proyectos o API vacía:", data?.error || data);
          setProyectos([]);
        }
      });
    fetch("https://amonhub.onrender.com/api/objetivos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      });
  }, []);

  const handleEditClick = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setEditingProyecto(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div>
        <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">PROYECTOS</h1>
        <div className="flex justify-end mb-4">
          <CustomButton onClick={() => router.push("/proyectos/nuevo")}>Crear Proyecto</CustomButton>
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-[#4A6670] text-white">
              <tr>
                <th className="py-2 px-4 text-left">Objetivo Estratégico Asociado</th>
                <th className="py-2 px-4 text-left">Nombre</th>
                <th className="py-2 px-4 text-left">Descripción</th>
                <th className="py-2 px-4 text-left">Responsable</th>
                <th className="py-2 px-4 text-left">Colaboradores</th>
                <th className="py-2 px-4 text-left">Tareas</th>
                <th className="py-2 px-4 text-left">Fecha de inicio</th>
                <th className="py-2 px-4 text-left">Fecha de fin</th>
                <th className="py-2 px-4 text-left">Estado</th>
                <th className="py-2 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => {
                const objetivo = objetivos.find(o => o.id === proyecto.objetivo_id);
                return (
                  <tr key={proyecto.id} className="border-b">
                    <td className="py-2 px-4 text-left">{objetivo ? objetivo.nombre : <span className="text-gray-400 italic">Sin objetivo</span>}</td>
                    <td className="py-2 px-4 text-left">{proyecto.nombre}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.descripcion}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.responsable}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.colaboradores}</td>
                    <td className="py-2 px-4 text-left text-sm">
                      {proyecto.Tareas && proyecto.Tareas.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {proyecto.Tareas.map((tarea, idx) => (
                            <li 
                              key={idx}
                              className={`
                                ${tarea.estado === 'Completada' ? 'text-green-600' : ''}
                                ${tarea.estado === 'Cancelada' ? 'text-red-600 line-through' : 'text-gray-900'}
                              `}
                            >
                              {tarea.nombre}
                               {tarea.estado === 'Cancelada' && tarea.cancel_reason && (
                                 <span className="text-red-600 text-xs ml-1">({tarea.cancel_reason})</span>
                               )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '- N/A -'
                      )}
                    </td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.fecha_inicio}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.fecha_fin}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.estado_avance}</td>
                    <td className="py-2 px-4 text-center space-x-2">
                      <CustomButton size="sm" variant="outline" onClick={() => handleEditClick(proyecto)}>Editar</CustomButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showEditModal && editingProyecto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#546b75]">Editar Proyecto</h2>
            <ProyectoForm
              modo="editar"
              proyecto={editingProyecto}
              onCancel={handleModalClose}
              onSave={handleModalClose}
            />
          </div>
        </div>
      )}
    </div>
  );
} 