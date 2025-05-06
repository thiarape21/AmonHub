"use client";
import { useParams } from "next/navigation";

// MOCK DATA (puedes reemplazar por fetch a la API)
const MOCK_OBJETIVOS = [
  {
    id: "o1",
    nombre: "Aumentar la participación comunitaria",
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
  }
  // Puedes agregar más objetivos aquí
];

export default function MonitoreoObjetivoDetalle() {
  const params = useParams();
  const objetivoId = params.id as string;
  const objetivo = MOCK_OBJETIVOS.find(o => o.id === objetivoId);

  if (!objetivo) {
    return <div className="container mx-auto py-8 text-center text-red-600">Objetivo no encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2 text-[#546b75]">Monitoreo: {objetivo.nombre}</h1>
      <div className="mb-4 text-gray-700">{objetivo.descripcion}</div>
      <div className="mb-8 text-sm text-gray-500">Estado inicial: {objetivo.estado_inicial || 'No definido'}</div>
      <h2 className="text-2xl font-semibold mb-4">Planes Operativos por Año</h2>
      {objetivo.planesOperativos && objetivo.planesOperativos.length > 0 ? (
        objetivo.planesOperativos.map(plan => (
          <div key={plan.id} className="mb-8 p-4 bg-white rounded shadow">
            <h3 className="text-xl font-bold mb-2">{plan.nombre} ({plan.anio})</h3>
            {plan.metas && plan.metas.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-2">Metas SMART</h4>
                <ul className="mb-2">
                  {plan.metas.map(meta => (
                    <li key={meta.id} className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className={meta.cumplida ? "text-green-700 font-semibold" : "text-yellow-700 font-semibold"}>
                          {meta.cumplida ? "✔" : "⏳"}
                        </span>
                        <span className={meta.cumplida ? "line-through" : ""}>{meta.nombre}</span>
                      </div>
                      {/* Actividades de la meta */}
                      <ul className="ml-6 mt-1">
                        {meta.actividades && meta.actividades.map((act, idx) => (
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
                    style={{ width: `${Math.round((plan.metas.filter(m => m.cumplida).length / plan.metas.length) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {plan.metas.filter(m => m.cumplida).length} de {plan.metas.length} metas cumplidas
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
  );
} 