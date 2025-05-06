"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  estado?: string;
  tareas?: { nombre: string; completada: boolean }[];
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
    planesOperativos: []
  },
];

const MOCK_PROYECTOS: Proyecto[] = [
  {
    id: "p1",
    nombre: "Festival de la Calle 15",
    descripcion: "Evento anual con música, arte y gastronomía local.",
    estado: "En ejecución",
    tareas: [
      { nombre: "Contratar artistas", completada: true },
      { nombre: "Solicitar permisos municipales", completada: true },
      { nombre: "Promocionar en redes sociales", completada: false },
    ],
    objetivos_asociados: ["o1", "o3"],
  },
  {
    id: "p2",
    nombre: "Campaña de Seguridad Vial",
    descripcion: "Charlas y señalización en puntos críticos del barrio.",
    estado: "Planificado",
    tareas: [
      { nombre: "Diseñar material educativo", completada: false },
      { nombre: "Colocar señales", completada: false },
    ],
    objetivos_asociados: ["o2"],
  },
  {
    id: "p3",
    nombre: "Mural colectivo",
    descripcion: "Creación de mural con participación de artistas locales y vecinos.",
    estado: "Completado",
    tareas: [
      { nombre: "Seleccionar artistas", completada: true },
      { nombre: "Preparar pared", completada: true },
      { nombre: "Inauguración", completada: true },
    ],
    objetivos_asociados: ["o3"],
  },
];

export default function MonitoreoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'monitoreo'>("proyectos");
  const [objetivoTipoFiltro, setObjetivoTipoFiltro] = useState<'estrategico' | 'operativo'>('estrategico');

  // Usar los datos mock
  const proyectos = MOCK_PROYECTOS;
  const objetivos = MOCK_OBJETIVOS.filter(o => o.tipo === "estrategico");

  // Relacionar proyectos a objetivos estratégicos
  const proyectosPorObjetivo = (objetivoId: string) =>
    proyectos.filter(p => p.objetivos_asociados?.includes(objetivoId));

  const renderProyectoCard = (proyecto: Proyecto) => {
    const tareasRealizadas = proyecto.tareas?.filter(t => t.completada) || [];
    const tareasPendientes = proyecto.tareas?.filter(t => !t.completada) || [];
    return (
      <div key={proyecto.id} className="bg-white rounded shadow p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">{proyecto.nombre}</h3>
        {proyecto.descripcion && <p className="mb-2 text-gray-700">{proyecto.descripcion}</p>}
        <div className="mb-2">
          <span className="font-medium">Estado:</span> {proyecto.estado || 'No definido'}
        </div>
        <div className="mb-2">
          <span className="font-medium">Tareas realizadas:</span>
          <ul className="ml-4 list-disc">
            {tareasRealizadas.length > 0 ? tareasRealizadas.map((t, i) => (
              <li key={i} className="text-green-700">{t.nombre}</li>
            )) : <li className="text-gray-400 italic">Ninguna</li>}
          </ul>
        </div>
        <div className="mb-2">
          <span className="font-medium">Tareas pendientes:</span>
          <ul className="ml-4 list-disc">
            {tareasPendientes.length > 0 ? tareasPendientes.map((t, i) => (
              <li key={i} className="text-yellow-700">{t.nombre}</li>
            )) : <li className="text-gray-400 italic">Ninguna</li>}
          </ul>
        </div>
        <div>
          <span className="font-medium">Objetivos asociados:</span>
          <ul className="ml-4 list-disc">
            {proyecto.objetivos_asociados && proyecto.objetivos_asociados.length > 0 ?
              proyecto.objetivos_asociados.map((oid, i) => (
                <li key={i}>{oid}</li>
              )) : <li className="text-gray-400 italic">Ninguno</li>}
          </ul>
        </div>
      </div>
    );
  };

  const renderObjetivoCard = (objetivo: Objetivo) => (
    <div key={objetivo.id} className="bg-white rounded shadow p-4 mb-4">
      <h3 className="text-xl font-semibold mb-2">{objetivo.nombre}</h3>
      <div className="mb-2">
        <span className="font-medium">Tipo:</span> {objetivo.tipo}
      </div>
      {objetivo.descripcion && <div className="mb-2"><span className="font-medium">Descripción:</span> {objetivo.descripcion}</div>}
      <div>
        <span className="font-medium">Estado inicial:</span> {objetivo.estado_inicial || 'No definido'}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">MONITOREO</h1>
      <div className="space-y-10">
        {objetivos.length === 0 ? (
          <div className="text-gray-500 italic">No hay objetivos estratégicos registrados.</div>
        ) : (
          objetivos.map(objetivo => (
            <div key={objetivo.id} className="bg-white rounded shadow p-6">
              <h2 className="text-2xl font-bold mb-2 text-[#4A6670]">{objetivo.nombre}</h2>
              <div className="mb-2 text-gray-700">{objetivo.descripcion}</div>
              <div className="mb-4 text-sm text-gray-500">Estado inicial: {objetivo.estado_inicial || 'No definido'}</div>
              {/* Planes operativos */}
              <h3 className="text-xl font-semibold mt-4 mb-2">Planes Operativos</h3>
              <div className="space-y-4">
                {objetivo.planesOperativos && objetivo.planesOperativos.length > 0 ? (
                  objetivo.planesOperativos.map((plan: any) => (
                    <div key={plan.id} className="mb-4 p-4 bg-gray-50 rounded shadow">
                      <h4 className="text-lg font-bold mb-1">{plan.nombre} ({plan.anio})</h4>
                      {plan.metas && plan.metas.length > 0 ? (
                        <div>
                          <ul className="mb-2">
                            {plan.metas.map((meta: any) => (
                              <li key={meta.id} className="mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={meta.cumplida ? "text-green-700 font-semibold" : "text-yellow-700 font-semibold"}>
                                    {meta.cumplida ? "✔" : "⏳"}
                                  </span>
                                  <span className={meta.cumplida ? "line-through" : ""}>{meta.nombre}</span>
                                </div>
                                {/* Actividades de la meta */}
                                <ul className="ml-6 mt-1">
                                  {meta.actividades && meta.actividades.map((act: any, idx: number) => (
                                    <li key={idx} className={act.completada ? "text-green-600" : "text-gray-700"}>
                                      {act.completada ? "●" : "○"} {act.nombre}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                          {/* Barra de progreso anual */}
                          <div className="w-full bg-gray-200 rounded h-3 mb-2">
                            <div
                              className="bg-blue-500 h-3 rounded"
                              style={{ width: `${Math.round((plan.metas.filter((m: any) => m.cumplida).length / plan.metas.length) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {plan.metas.filter((m: any) => m.cumplida).length} de {plan.metas.length} metas cumplidas
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">No hay metas para este año.</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No hay planes operativos asociados a este objetivo.</div>
                )}
              </div>
              {/* Proyectos asociados */}
              <h3 className="text-xl font-semibold mt-6 mb-2">Proyectos Asociados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proyectosPorObjetivo(objetivo.id).length === 0 ? (
                  <div className="text-gray-500 italic col-span-2">No hay proyectos asociados.</div>
                ) : (
                  proyectosPorObjetivo(objetivo.id).map(proyecto => (
                    <div key={proyecto.id} className="bg-gray-50 rounded shadow p-4">
                      <h4 className="text-lg font-semibold mb-1">{proyecto.nombre}</h4>
                      <div className="mb-1 text-gray-700">{proyecto.descripcion}</div>
                      <div className="mb-1 text-sm"><span className="font-medium">Estado:</span> {proyecto.estado || 'No definido'}</div>
                      <div className="mb-1 text-sm font-medium">Tareas realizadas:</div>
                      <ul className="ml-4 mb-1">
                        {proyecto.tareas?.filter(t => t.completada).length ? (
                          proyecto.tareas?.filter(t => t.completada).map((t, i) => (
                            <li key={i} className="text-green-700">{t.nombre}</li>
                          ))
                        ) : <li className="text-gray-400 italic">Ninguna</li>}
                      </ul>
                      <div className="mb-1 text-sm font-medium">Tareas pendientes:</div>
                      <ul className="ml-4">
                        {proyecto.tareas?.filter(t => !t.completada).length ? (
                          proyecto.tareas?.filter(t => !t.completada).map((t, i) => (
                            <li key={i} className="text-yellow-700">{t.nombre}</li>
                          ))
                        ) : <li className="text-gray-400 italic">Ninguna</li>}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 