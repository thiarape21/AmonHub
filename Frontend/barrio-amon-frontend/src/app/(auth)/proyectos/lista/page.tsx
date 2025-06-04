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

// Utility function to determine project status based on tasks
function getProjectStatus(Tareas: Proyecto['Tareas']): string {
  if (!Tareas || Tareas.length === 0) {
    return "Pendiente";
  }

  const totalTasks = Tareas.length;
  const completedTasks = Tareas.filter(tarea => tarea.estado === 'Completada').length;
  const canceledTasks = Tareas.filter(tarea => tarea.estado === 'Cancelada').length;
  const inProgressOrPendingTasks = Tareas.filter(tarea => tarea.estado === 'En proceso' || tarea.estado === 'Pendiente').length;

  if (canceledTasks === totalTasks) {
    return "Cancelado";
  } else if (canceledTasks > 0) {
     // If some are canceled, and all non-canceled are completed
     if (completedTasks + canceledTasks === totalTasks) {
       return "Completada (con cancelaciones)";
     } else {
        return "En proceso (con cancelaciones)"; // Or another appropriate mixed status
     }
  } else if (completedTasks === totalTasks) {
    return "Completada";
  } else if (inProgressOrPendingTasks > 0) {
    return "En proceso";
  } else {
     return "Pendiente"; // Should not reach here if tasks exist but none are in above states
  }
}

export default function ProyectosListaPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Comentado temporalmente para evitar el error de base de datos
    // fetch("http://localhost:3030/api/proyectos")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (Array.isArray(data)) {
    //       setProyectos(data);
    //     } else {
    //       setProyectos([]);
    //       console.error("Error al obtener proyectos:", data?.error || data);
    //     }
    //   });
    fetch("http://localhost:3030/api/proyectos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProyectos(data);
        } else {
          // Si la API falla o está vacía, usar datos de ejemplo
          console.error("Error al obtener proyectos o API vacía:", data?.error || data);
          setProyectos(proyectosEjemplo as Proyecto[]); // Usar datos de ejemplo
        }
      });
    console.log("proyectos", proyectos);
    fetch("http://localhost:3030/api/objetivos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    
    await fetch(`http://localhost:3030/api/proyectos/${id}`, { method: "DELETE" });
    setProyectos(proyectos.filter((p) => p.id !== id));
  };

  const handleEditClick = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setEditingProyecto(null);
    // Aquí podrías volver a fetchear proyectos si es necesario actualizar la lista después de guardar
    // fetch("http://localhost:3030/api/proyectos")...
  };

  // Ejemplo de proyecto para mostrar en la lista
  const proyectosEjemplo = [
    {
      id: 1,
      nombre: "Mejorar la Plaza Central",
      descripcion: "Proyecto para renovar la plaza central del barrio, incluyendo áreas verdes, bancas y luminarias.",
      objetivo_id: 1,
      estado_avance: "En proceso",
      fecha_inicio: "2024-06-01",
      fecha_fin: "2024-12-31",
      colaboradores: "Ana Gómez,Juan Pérez",
      responsable: "Carlos Ruiz",
      Tareas: [
        {
          nombre: "Diseñar el nuevo plano de la plaza",
          responsable: "Ana Gómez",
          fecha_inicio: "2024-06-01",
          fecha_fin: "2024-06-15",
          estado: "Completada" as "Completada",
        },
        {
          nombre: "Contratar empresa constructora",
          responsable: "Juan Pérez",
          fecha_inicio: "2024-06-16",
          fecha_fin: "2024-07-01",
          estado: "En proceso" as "En proceso",
        },
        {
          nombre: "Supervisar la instalación de luminarias",
          responsable: "Carlos Ruiz",
          fecha_inicio: "2024-07-10",
          fecha_fin: "2024-08-01",
          estado: "Pendiente" as "Pendiente",
        },
        {
          nombre: "Tarea Cancelada Ejemplo",
          responsable: "María López",
          fecha_inicio: "2024-07-10",
          fecha_fin: "2024-08-01",
          estado: "Cancelada" as "Cancelada",
          cancel_reason: "Recursos insuficientes",
        }
      ]
    }
  ];

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
              {(proyectos.length > 0 ? proyectos : proyectosEjemplo).map((proyecto) => {
                const objetivo = objetivos.find(o => o.id === proyecto.objetivo_id);
                // Determine project status based on tasks
                const projectStatus = getProjectStatus(proyecto.Tareas);
                console.log("proyectoxxx", proyecto);
                return (
                  <tr key={proyecto.id} className="border-b">
                    <td className="py-2 px-4 text-left">{objetivo ? objetivo.nombre : <span className="text-gray-400 italic">Sin objetivo</span>}</td>
                    <td className="py-2 px-4 text-left">{proyecto.nombre}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.descripcion}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.responsable}</td>
                    <td className="py-2 px-4 text-left text-sm">{proyecto.colaboradores}</td>
                    <td className="py-2 px-4 text-left text-sm">
                      {/* Display tasks */}
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