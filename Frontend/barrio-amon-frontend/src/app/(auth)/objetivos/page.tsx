"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";

interface FodaElement {
  id: string;
  texto: string;
  tipo: 'fortaleza' | 'oportunidad' | 'debilidad' | 'amenaza';
  dimension: string; // Para agrupar por contenido temático
}

interface Objetivo {
  id?: string;
  nombre: string;
  descripcion: string;
  elementosFoda: {
    mantener: FodaElement[]; // Fortalezas a mantener
    explotar: FodaElement[]; // Oportunidades a explotar
    corregir: FodaElement[]; // Debilidades a corregir
    afrontar: FodaElement[]; // Amenazas a afrontar
  };
  responsable?: string;
  colaboradores?: string;
  planesOperativos?: PlanOperativo[];
}

interface PlanOperativo {
  id?: string;
  nombre: string;
  descripcion: string;
  elementosFoda: {
    mantener: FodaElement[];
    explotar: FodaElement[];
    corregir: FodaElement[];
    afrontar: FodaElement[];
  };
  responsable?: string;
  colaboradores?: string;
  metas: Meta[];
}

interface Meta {
  id?: string;
  nombre: string;
  cumplida: boolean;
  actividades?: string[];
}

interface Tarea {
  id?: string;
  nombre: string;
  cumplida: boolean;
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([
    {
      id: "1",
      nombre: "Desarrollo Sostenible del Barrio",
      descripcion: "Promover el desarrollo sostenible del barrio Amón a través de iniciativas que mejoren la calidad de vida de sus habitantes y preserven su patrimonio histórico.",
      elementosFoda: {
        mantener: [],
        explotar: [],
        corregir: [],
        afrontar: []
      },
      responsable: "Juan Pérez",
      colaboradores: "María García, Carlos López",
      planesOperativos: [
        {
          id: "1",
          nombre: "Plan de Mejoras Inmediatas 2024",
          descripcion: "Implementación de mejoras inmediatas para el desarrollo sostenible del barrio Amón, enfocadas en infraestructura, espacios verdes y turismo cultural.",
          elementosFoda: {
            mantener: [],
            explotar: [],
            corregir: [],
            afrontar: []
          },
          responsable: "María García",
          colaboradores: "Carlos López, Ana Martínez",
          metas: [
            {
              id: "1",
              nombre: "Realizar diagnóstico completo de infraestructura en 3 meses",
              cumplida: false,
              actividades: [
                "Contratar consultoría técnica especializada",
                "Realizar inspección detallada de edificios históricos",
                "Evaluar estado de aceras y calles",
                "Elaborar informe de diagnóstico con recomendaciones",
                "Presentar resultados a la comunidad"
              ]
            },
            {
              id: "2",
              nombre: "Implementar 2 espacios verdes en 6 meses",
              cumplida: false,
              actividades: [
                "Identificar y evaluar terrenos disponibles",
                "Diseñar áreas verdes con participación comunal",
                "Obtener permisos municipales necesarios",
                "Gestionar recursos y donaciones",
                "Ejecutar obras de construcción",
                "Realizar mantenimiento inicial"
              ]
            }
          ]
        }
      ]
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editObjetivo, setEditObjetivo] = useState<Objetivo | null>(null);
  const [editPlanOperativo, setEditPlanOperativo] = useState<PlanOperativo | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [elementosFoda, setElementosFoda] = useState<Objetivo['elementosFoda']>({
    mantener: [],
    explotar: [],
    corregir: [],
    afrontar: []
  });
  const [responsable, setResponsable] = useState("");
  const [colaboradores, setColaboradores] = useState("");
  const [metas, setMetas] = useState<Meta[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; full_name: string }[]>([]);
  const [elementosFodaDisponibles, setElementosFodaDisponibles] = useState<FodaElement[]>([]);
  const [selectedFortalezaId, setSelectedFortalezaId] = useState("");


  useEffect(() => {
    fetch("http://localhost:3030/api/objetivos")
      .then((res) => {
        if (!res.ok) throw new Error(`Error fetching objetivos: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setObjetivos(data);
        else setObjetivos([]);
      })
      .catch((error) => console.error("Failed to fetch objetivos:", error));

    fetch("http://localhost:3030/api/usuarios")
      .then((res) => {
        if (!res.ok) throw new Error(`Error fetching usuarios: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsuarios(data);
        else setUsuarios([]);
      })
      .catch((error) => console.error("Failed to fetch usuarios:", error));

    fetch("http://localhost:3030/api/analisis-foda")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setElementosFodaDisponibles(data))
      .catch((error) => console.error("Failed to fetch FODA:", error));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const objetivo: Objetivo = {
      nombre,
      descripcion,
      elementosFoda,
      responsable,
      colaboradores,
      planesOperativos: editPlanOperativo ? [editPlanOperativo] : [],
    };
    let url = "http://localhost:3030/api/objetivos";
    let method = "POST";
    if (editObjetivo) {
      url += `/${editObjetivo.id}`;
      method = "PUT";
    }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objetivo),
    });
    if (res.ok) {
      setShowForm(false);
      setEditObjetivo(null);
      setEditPlanOperativo(null);
      setNombre("");
      setDescripcion("");
      setElementosFoda({ mantener: [], explotar: [], corregir: [], afrontar: [] });
      setResponsable("");
      setColaboradores("");
      setMetas([]);
      // Refrescar lista
      fetch("http://localhost:3030/api/objetivos")
        .then((res) => res.json())
        .then((data) => Array.isArray(data) && setObjetivos(data));
    }
  };

  const handleEdit = (objetivo: Objetivo) => {
    setEditObjetivo(objetivo);
    setEditPlanOperativo(null);
    setNombre(objetivo.nombre);
    setDescripcion(objetivo.descripcion);
    setElementosFoda(objetivo.elementosFoda);
    setResponsable(objetivo.responsable || "");
    setColaboradores(objetivo.colaboradores || "");
    setMetas(objetivo.planesOperativos?.flatMap(po => po.metas || []) || []);

  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("¿Seguro que deseas eliminar este objetivo?")) return;
    await fetch(`http://localhost:3030/api/objetivos/${id}`, { method: "DELETE" });
    setObjetivos(objetivos.filter((o) => o.id !== id));
  };

  // Utilidad para manejar colaboradores como array
  const colaboradoresArray = colaboradores ? colaboradores.split(",") : [];
  // Si el responsable está en colaboradores, lo quitamos automáticamente
  useEffect(() => {
    if (responsable && colaboradoresArray.includes(responsable)) {
      setColaboradores(colaboradoresArray.filter((c) => c !== responsable).join(","));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsable]);
  const handleAddColaborador = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !colaboradoresArray.includes(value)) {
      setColaboradores([...colaboradoresArray, value].join(","));
    }
  };
  const handleRemoveColaborador = (name: string) => {
    setColaboradores(colaboradoresArray.filter((c) => c !== name).join(","));
  };

  useEffect(() => {
    console.log("⚠️ Renderizando select con:", elementosFodaDisponibles);
  }, [elementosFodaDisponibles]);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">OBJETIVOS</h1>
      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => { 
          setShowForm(true); 
          setEditObjetivo(null);
          setEditPlanOperativo(null);
          setNombre("");
          setDescripcion("");
          setElementosFoda({ mantener: [], explotar: [], corregir: [], afrontar: [] });
          setResponsable("");
          setColaboradores("");
          setMetas([]);
        }}>Crear Objetivo Estratégico</CustomButton>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-[#4A6670] text-white">
            <tr>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Descripción</th>
              <th className="py-2 px-4">Planes Operativos Asociados</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {objetivos.map((objetivo) => (
              <tr key={objetivo.id} className="border-b">
                <td className="py-2 px-4">{objetivo.nombre}</td>
                <td className="py-2 px-4">{objetivo.descripcion}</td>
                <td className="py-2 px-4">
                  {objetivo.planesOperativos?.length || 0} planes operativos
                </td>
                <td className="py-2 px-4 space-x-2">
                  <CustomButton size="sm" variant="outline" onClick={() => handleEdit(objetivo)}>Editar</CustomButton>
                  <CustomButton size="sm" variant="outline" onClick={() => {
                    setShowForm(true);
                    setEditObjetivo(objetivo);
                    setEditPlanOperativo(null);
                    setNombre("");
                    setDescripcion("");
                    setElementosFoda({ mantener: [], explotar: [], corregir: [], afrontar: [] });
                    setResponsable("");
                    setColaboradores("");
                    setMetas([]);
                  }}>Crear Plan Operativo</CustomButton>
                  <CustomButton size="sm" variant="destructive" onClick={() => handleDelete(objetivo.id)}>Eliminar</CustomButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal/Formulario */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 md:col-span-2">
              {editObjetivo ? (editPlanOperativo ? "Editar Plan Operativo" : "Crear Plan Operativo") : "Crear Objetivo Estratégico"}
            </h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Nombre</label>
              <input className="w-full border rounded p-2" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea className="w-full border rounded p-2" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block font-semibold mb-1">Elementos FODA</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Mantener Fortalezas</h3>
<select
  className="w-full border rounded p-2 mb-2"
  onChange={(e) => {
    const id = e.target.value;
    const elemento = elementosFodaDisponibles.find(f => f.id === id);

    console.log("✅ FODA seleccionado:", id, elemento);

    if (
      elemento &&
      elemento.tipo === 'fortaleza' &&
      !elementosFoda.mantener.some(f => f.id === id)
    ) {
      setElementosFoda(prev => ({
        ...prev,
        mantener: [...prev.mantener, elemento],
      }));
    }
  }}
>
  <option value="">Seleccionar fortaleza...</option>
  {elementosFodaDisponibles
    .filter(f => f.tipo === 'fortaleza')
    .map(f => (
      <option key={f.id} value={f.id}>{f.texto}</option>
    ))}
</select>



                  <div className="space-y-2">
                    {elementosFoda.mantener.map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                        <span className="flex-1">{f.texto}</span>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => setElementosFoda(prev => ({
                            ...prev,
                            mantener: prev.mantener.filter(m => m.id !== f.id)
                          }))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                <h3 className="font-semibold mb-2">Explotar Oportunidades</h3>
<select
  className="w-full border rounded p-2 mb-2"
  onChange={(e) => {
    const id = e.target.value;
    const elemento = elementosFodaDisponibles.find(f => f.id === id);

    console.log("✅ Oportunidad seleccionada:", id, elemento);

    if (
      elemento &&
      elemento.tipo === 'oportunidad' &&
      !elementosFoda.explotar.some(f => f.id === id)
    ) {
      setElementosFoda(prev => ({
        ...prev,
        explotar: [...prev.explotar, elemento],
      }));
    }
  }}
>
  <option value="">Seleccionar oportunidad...</option>
  {elementosFodaDisponibles
    .filter(f => f.tipo === 'oportunidad')
    .map(f => (
      <option key={f.id} value={f.id}>{f.texto}</option>
    ))}
</select>
                  <div className="space-y-2">
                    {elementosFoda.explotar.map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                        <span className="flex-1">{f.texto}</span>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => setElementosFoda(prev => ({
                            ...prev,
                            explotar: prev.explotar.filter(m => m.id !== f.id)
                          }))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                <h3 className="font-semibold mb-2">Corregir Debilidades</h3>
<select
  className="w-full border rounded p-2 mb-2"
  onChange={(e) => {
    const id = e.target.value;
    const elemento = elementosFodaDisponibles.find(f => f.id === id);

    console.log("✅ Debilidad seleccionada:", id, elemento);

    if (
      elemento &&
      elemento.tipo === 'debilidad' &&
      !elementosFoda.corregir.some(f => f.id === id)
    ) {
      setElementosFoda(prev => ({
        ...prev,
        corregir: [...prev.corregir, elemento],
      }));
    }
  }}
>
  <option value="">Seleccionar debilidad...</option>
  {elementosFodaDisponibles
    .filter(f => f.tipo === 'debilidad')
    .map(f => (
      <option key={f.id} value={f.id}>{f.texto}</option>
    ))}
</select>

                  <div className="space-y-2">
                    {elementosFoda.corregir.map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-yellow-50 p-2 rounded">
                        <span className="flex-1">{f.texto}</span>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => setElementosFoda(prev => ({
                            ...prev,
                            corregir: prev.corregir.filter(m => m.id !== f.id)
                          }))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                <h3 className="font-semibold mb-2">Afrontar Amenazas</h3>
<select
  className="w-full border rounded p-2 mb-2"
  onChange={(e) => {
    const id = e.target.value;
    const elemento = elementosFodaDisponibles.find(f => f.id === id);

    console.log("✅ Amenaza seleccionada:", id, elemento);

    if (
      elemento &&
      elemento.tipo === 'amenaza' &&
      !elementosFoda.afrontar.some(f => f.id === id)
    ) {
      setElementosFoda(prev => ({
        ...prev,
        afrontar: [...prev.afrontar, elemento],
      }));
    }
  }}
>
  <option value="">Seleccionar amenaza...</option>
  {elementosFodaDisponibles
    .filter(f => f.tipo === 'amenaza')
    .map(f => (
      <option key={f.id} value={f.id}>{f.texto}</option>
    ))}
</select>

                  <div className="space-y-2">
                    {elementosFoda.afrontar.map(f => (
                      <div key={f.id} className="flex items-center gap-2 bg-red-50 p-2 rounded">
                        <span className="flex-1">{f.texto}</span>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => setElementosFoda(prev => ({
                            ...prev,
                            afrontar: prev.afrontar.filter(m => m.id !== f.id)
                          }))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Responsable</label>
              <select
                className="w-full border rounded p-2"
                value={responsable}
                onChange={e => setResponsable(e.target.value)}
              >
                <option value="">Selecciona un responsable</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.full_name}>{u.full_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Colaboradores</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colaboradores.split(",").filter(Boolean).map((colab) => (
                  <span key={colab} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                    {colab}
                    <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleRemoveColaborador(colab)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                className="w-full border rounded p-2"
                value=""
                onChange={handleAddColaborador}
              >
                <option value="">Agregar colaborador...</option>
                {usuarios.filter(u => u.full_name !== responsable && !colaboradores.split(",").includes(u.full_name)).map((u) => (
                  <option key={u.id} value={u.full_name}>{u.full_name}</option>
                ))}
              </select>
            </div>
            {/* Solo mostrar metas si es plan operativo */}
            {editObjetivo && !editPlanOperativo && (
              <div className="mb-4 md:col-span-2">
                <label className="block font-semibold mb-1">Metas SMART (1 año)</label>
                <div className="text-xs text-gray-500 mb-2">
                  Las metas deben ser: Específicas, Medibles, Alcanzables, Relevantes y con plazo de 1 año
                </div>
                <MetaManager metas={metas} setMetas={setMetas} />
              </div>
            )}
            <div className="flex justify-end gap-2 md:col-span-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</CustomButton>
              <CustomButton type="submit">{editObjetivo ? (editPlanOperativo ? "Guardar Plan" : "Crear Plan") : "Crear Objetivo"}</CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MetaManager({ metas, setMetas }: { metas: Meta[]; setMetas: (m: Meta[]) => void }) {
  const [nuevaMeta, setNuevaMeta] = useState("");
  const [nuevaActividad, setNuevaActividad] = useState("");

  const handleAddMeta = () => {
    if (nuevaMeta.trim()) {
      setMetas([...metas, { nombre: nuevaMeta.trim(), cumplida: false }]);
      setNuevaMeta("");
    }
  };

  const handleCheckMeta = (idx: number) => {
    const nuevasMetas = [...metas];
    nuevasMetas[idx].cumplida = !nuevasMetas[idx].cumplida;
    setMetas(nuevasMetas);
  };

  const handleRemoveMeta = (idx: number) => {
    setMetas(metas.filter((_, i) => i !== idx));
  };

  const handleAddActividad = () => {
    if (nuevaActividad.trim() && metas.length > 0) {
      const ultimaMeta = metas[metas.length - 1];
      const nuevasMetas = [...metas];
      nuevasMetas[metas.length - 1] = {
        ...ultimaMeta,
        actividades: [...(ultimaMeta.actividades || []), nuevaActividad.trim()]
      };
      setMetas(nuevasMetas);
      setNuevaActividad("");
    }
  };

  return (
    <div>
      <ul className="mb-2">
        {metas.map((meta, idx) => (
          <li key={idx} className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={meta.cumplida} onChange={() => handleCheckMeta(idx)} />
            <span className={meta.cumplida ? "line-through" : ""}>{meta.nombre}</span>
            <button type="button" className="text-red-500" onClick={() => handleRemoveMeta(idx)}>Eliminar</button>
            {/* Actividades de la meta */}
            <ul className="ml-4">
              {meta.actividades && meta.actividades.map((act, aidx) => (
                <li key={aidx} className="text-xs flex items-center gap-1">
                  - {act}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded p-1 flex-1"
          placeholder="Nueva meta SMART"
          value={nuevaMeta}
          onChange={e => setNuevaMeta(e.target.value)}
        />
        <button type="button" className="bg-blue-500 text-white px-2 rounded" onClick={handleAddMeta}>Agregar meta</button>
      </div>
      {/* Agregar actividades a la meta que se está creando */}
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded p-1 flex-1"
          placeholder="Actividad para la nueva meta"
          value={nuevaActividad}
          onChange={e => setNuevaActividad(e.target.value)}
        />
        <button type="button" className="bg-green-500 text-white px-2 rounded" onClick={handleAddActividad}>Agregar actividad</button>
      </div>
    </div>
  );
} 