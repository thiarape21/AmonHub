"use client";

const MOCK_NOTIFICACIONES = [
  { proyecto: "Restauración de Fachadas Históricas", estado: "Retraso", recibido: false },
  { proyecto: "Rutas Turísticas Culturales", estado: "Pendiente", recibido: false },
  { proyecto: "Reforestación y Áreas Verdes Urbanas", estado: "Finalizada", recibido: false },
];

export default function NotificacionesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-[#546b75]">ALERTAS Y NOTIFICACIONES</h1>
      <p className="text-center mb-6 text-lg text-gray-700">Proyectos en riesgo</p>
      <div className="overflow-x-auto rounded-lg shadow max-w-2xl mx-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-[#4A6670] text-white">
            <tr>
              <th className="py-2 px-4">Proyecto</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4">Recibido</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_NOTIFICACIONES.map((n, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2 px-4">{n.proyecto}</td>
                <td className="py-2 px-4">{n.estado}</td>
                <td className="py-2 px-4 text-center">
                  <input type="checkbox" checked={n.recibido} readOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 