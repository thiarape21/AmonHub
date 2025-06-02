"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  estado?: string;
  tareas?: { nombre: string; completada: boolean; responsable?: string; fecha_inicio?: string; fecha_fin?: string; estado?: string }[];
  objetivos_asociados?: string[];
}

interface Objetivo {
  id: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  estado_inicial?: string;
}

// Datos de ejemplo
const MOCK_OBJETIVOS: (Objetivo & { planesOperativos?: any[] })[] = [
  {
    id: "o1",
    nombre: "Aumentar la participación comunitaria",
    tipo: "estrategico",
    descripcion: "Fomentar la integración y participación de los vecinos en actividades del barrio.",
    estado_inicial: "En progreso",
    planesOperativos: [
      {
        id: "po1",
        nombre: "Plan Operativo 2023",
        anio: 2023,
        metas: [
          {
            id: "m1",
            nombre: "Realizar 5 actividades comunitarias",
            cumplida: true,
            actividades: [
              { nombre: "Taller de arte", completada: true },
              { nombre: "Feria de salud", completada: true },
              { nombre: "Cine al aire libre", completada: true },
              { nombre: "Jornada de limpieza", completada: true },
              { nombre: "Festival gastronómico", completada: true }
            ]
          }
        ]
      },
      {
        id: "po2",
        nombre: "Plan Operativo 2024",
        anio: 2024,
        metas: [
          {
            id: "m2",
            nombre: "Aumentar la participación en un 20%",
            cumplida: false,
            actividades: [
              { nombre: "Campaña en redes sociales", completada: false },
              { nombre: "Encuesta de satisfacción", completada: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "o2",
    nombre: "Mejorar la seguridad vial",
    tipo: "operativo",
    descripcion: "Implementar señalización y campañas de educación vial.",
    estado_inicial: "Pendiente",
  },
  {
    id: "o3",
    nombre: "Promover el arte urbano",
    tipo: "estrategico",
    descripcion: "Apoyar murales y actividades culturales en espacios públicos.",
    estado_inicial: "Completado",
    planesOperativos: [
      {
        id: "po3",
        nombre: "Plan Operativo 2024",
        anio: 2024,
        metas: [
          {
            id: "m3",
            nombre: "Crear 3 nuevos murales comunitarios",
            cumplida: false,
            actividades: [
              { nombre: "Seleccionar ubicaciones", completada: true },
              { nombre: "Convocar artistas locales", completada: false },
              { nombre: "Organizar jornadas de pintura", completada: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "o4",
    nombre: "Desarrollar infraestructura verde",
    tipo: "estrategico",
    descripcion: "Crear y mejorar espacios verdes para la comunidad.",
    estado_inicial: "Planificado",
    planesOperativos: [
      {
        id: "po4",
        nombre: "Plan Operativo 2025",
        anio: 2025,
        metas: [
          {
            id: "m4",
            nombre: "Inaugurar un nuevo parque vecinal",
            cumplida: false,
            actividades: [
              { nombre: "Diseño del parque", completada: true },
              { nombre: "Adquisición de terrenos", completada: false },
              { nombre: "Construcción y paisajismo", completada: false },
              { nombre: "Acto de inauguración", completada: false }
            ]
          },
          {
            id: "m5",
            nombre: "Reforestar áreas degradadas",
            cumplida: false,
            actividades: [
              { nombre: "Identificación de áreas", completada: true },
              { nombre: "Preparación del suelo", completada: true },
              { nombre: "Jornadas de siembra", completada: false }
            ]
          }
        ]
      }
    ]
  }
];

const MOCK_PROYECTOS: Proyecto[] = [
  {
    id: "p1",
    nombre: "Festival de la Calle 15",
    descripcion: "Evento anual con música, arte y gastronomía local.",
    estado: "En ejecución",
    tareas: [
      { nombre: "Contratar artistas", completada: true, responsable: "Ana Gómez", fecha_inicio: "", fecha_fin: "", estado: "Completada" },
      { nombre: "Solicitar permisos municipales", completada: true, responsable: "Juan Pérez", fecha_inicio: "", fecha_fin: "", estado: "Completada" },
      { nombre: "Promocionar en redes sociales", completada: false, responsable: "Carlos Ruiz", fecha_inicio: "", fecha_fin: "", estado: "En proceso" },
    ],
    objetivos_asociados: ["o1", "o3"],
  },
  {
    id: "p2",
    nombre: "Campaña de Seguridad Vial",
    descripcion: "Charlas y señalización en puntos críticos del barrio.",
    estado: "Planificado",
    tareas: [
      { nombre: "Diseñar material educativo", completada: false, responsable: "Ana Gómez", fecha_inicio: "", fecha_fin: "", estado: "Pendiente" },
      { nombre: "Colocar señales", completada: false, responsable: "Juan Pérez", fecha_inicio: "", fecha_fin: "", estado: "Pendiente" },
    ],
    objetivos_asociados: ["o2"],
  },
  {
    id: "p3",
    nombre: "Mural colectivo",
    descripcion: "Creación de mural con participación de artistas locales y vecinos.",
    estado: "Completado",
    tareas: [
      { nombre: "Seleccionar artistas", completada: true, responsable: "Carlos Ruiz", fecha_inicio: "", fecha_fin: "", estado: "Completado" },
      { nombre: "Preparar pared", completada: true, responsable: "Ana Gómez", fecha_inicio: "", fecha_fin: "", estado: "Completado" },
      { nombre: "Inauguración", completada: true, responsable: "Juan Pérez", fecha_inicio: "", fecha_fin: "", estado: "Completado" },
    ],
    objetivos_asociados: ["o3"],
  },
];

export default function MonitoreoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'monitoreo'>("proyectos");
  const [objetivoTipoFiltro, setObjetivoTipoFiltro] = useState<'estrategico' | 'operativo'>('estrategico');

  // Add state for selected year, default to current year or a relevant year in data
  const [selectedYear, setSelectedYear] = useState<number>(2024); // Assuming 2024 is a relevant starting year

  // Generate a list of years for the dropdown (e.g., from 2020 to current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: (currentYear + 5) - 2023 + 1 }, (_, i) => 2023 + i);

  // Usar los datos mock (Reemplazar con fetch real cuando el backend esté listo)
  const proyectos = MOCK_PROYECTOS;
  // Filtrar solo objetivos estratégicos para esta vista principal
  const objetivosEstrategicos = MOCK_OBJETIVOS.filter(o => o.tipo === "estrategico");

  // Filter objectives and their plans by selected year
  const filteredObjetivos = objetivosEstrategicos
    .map(objetivo => ({
      ...objetivo,
      planesOperativos: (objetivo.planesOperativos || []).filter((plan: any) => plan.anio === selectedYear)
    }))
    .filter(objetivo => objetivo.planesOperativos.length > 0); // Only keep objectives that have plans for the selected year

  // Group projects by associated strategic objective (still needed for task display, even if simplified)
  const proyectosPorObjetivo = (objetivoId: string) =>
    proyectos.filter(p => p.objetivos_asociados?.includes(objetivoId));

  return (
    <div className="container mx-auto py-8">

      {/* Year Selection */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="yearSelect" className="font-semibold text-gray-700">Seleccionar Año:</label>
        <select
          id="yearSelect"
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md shadow-sm p-2"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">Plan Operativo {selectedYear}</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-[#4A6670] text-white">
              <th className="border border-gray-300 py-2 px-4 text-left">Objetivos Estratégicos</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Metas</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Actividades</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Indicadores</th>
            </tr>
          </thead>
          <tbody>
            {filteredObjetivos.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-gray-300 py-2 px-4 text-center text-gray-500 italic">No hay datos disponibles para el año seleccionado.</td>
              </tr>
            ) : (
              filteredObjetivos.map((objetivo, objIndex) => {
                const objetivoPlans = objetivo.planesOperativos || [];

                // Calculate total rows for the objective
                const totalObjectiveRows = objetivoPlans.reduce((planSum: number, plan: any) => {
                  const planMetas = plan.metas || [];
                  const totalPlanRows = planMetas.reduce((metaSum: number, meta: any) => {
                    const totalMetaRows = Math.max(meta.actividades?.length || 0, 1);
                    return metaSum + totalMetaRows;
                  }, 0) || 1;
                  return planSum + totalPlanRows;
                }, 0) || 1;

                let isFirstObjectiveRow = true;

                // Since we removed the Plan column, we can flatten plans here
                return objetivoPlans.flatMap((plan: any, planIndex: number) => {
                  const planMetas = plan.metas || [];

                  // Calculate total rows for the *remaining* columns within this plan
                   const totalRowsInPlanRemainingColumns = planMetas.reduce((metaSum: number, meta: any) => {
                    const totalMetaRows = Math.max(meta.actividades?.length || 0, 1);
                    return metaSum + totalMetaRows;
                   }, 0) || 1;

                  let isFirstPlanContentRow = true; // Flag for the first row within this plan's content

                  return planMetas.flatMap((meta: any, metaIndex: number) => {
                    const metaActivities = meta.actividades || [];

                    // Calculate total rows for the meta
                    const totalMetaRows = Math.max(metaActivities.length, 1);

                    let isFirstMetaRow = true;

                    if (metaActivities.length === 0) {
                      // Case: Meta with no activities
                      const row = (
                        <tr key={`${meta.id}-no-activities`} className={objIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {isFirstObjectiveRow && (
                            <td rowSpan={totalObjectiveRows} className="border border-gray-300 py-2 px-4 font-semibold align-top">{objetivo.nombre}</td>
                          )}
                           {/* Removed Plan column content */}
                          {isFirstMetaRow && (
                            <td rowSpan={totalMetaRows} className="border border-gray-300 py-2 px-4 text-sm align-top">{meta.nombre}</td>
                          )}
                          <td className="border border-gray-300 py-2 px-4 text-center text-gray-500 italic">No hay actividades para esta meta.</td>
                          <td className="border border-gray-300 py-2 px-4 text-center text-gray-500 italic"></td>
                        </tr>
                      );
                      isFirstObjectiveRow = false;
                      isFirstPlanContentRow = false;
                      isFirstMetaRow = false;
                      return row;
                    } else {
                      // Case: Meta with activities
                      return metaActivities.map((activity: any, activityIndex: number) => {
                        const row = (
                          <tr key={`${meta.id}-activity-${activityIndex}`} className={objIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            {/* Objective Cell */}
                            {isFirstObjectiveRow && (
                              <td rowSpan={totalObjectiveRows} className="border border-gray-300 py-2 px-4 font-semibold align-top">{objetivo.nombre}</td>
                            )}
                             {/* Removed Plan column content */}
                            {/* Meta Cell */}
                            {isFirstMetaRow && (
                              <td rowSpan={totalMetaRows} className="border border-gray-300 py-2 px-4 text-sm align-top">{meta.nombre}</td>
                            )}
                            {/* Activity Cell */}
                            <td className="border border-gray-300 py-2 px-4 text-sm">
                              {activity.nombre}
                            </td>
                            {/* Indicators Cell (Placeholder) */}
                            <td className="border border-gray-300 py-2 px-4 text-sm text-gray-500 italic">
                              {/* TODO: Display activity evidence here when available from backend */}
                              No hay indicadores disponibles en mock data.
                            </td>
                          </tr>
                        );
                        if (isFirstObjectiveRow) isFirstObjectiveRow = false;
                        if (isFirstPlanContentRow) isFirstPlanContentRow = false;
                        if (isFirstMetaRow) isFirstMetaRow = false;
                        return row;
                      });
                    }
                  }); // No .flat() here, handled by the outer flatMap
                }); // No .flat() here, handled by the outer flatMap
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 