"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import Select from 'react-select';

interface FodaElement {
  id: string;
  texto: string;
  tipo: 'fortaleza' | 'oportunidad' | 'debilidad' | 'amenaza';
  dimension: string; // Para agrupar por contenido temático
  asociado?: string;
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
  anio: number;
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
      nombre: "Mejorar la infraestructura básica del barrio",
      descripcion: "Renovar las calles principales y arreglar las aceras para asegurar una mejor movilidad y accesibilidad para todos los habitantes, especialmente personas con movilidad reducida.",
      elementosFoda: {
        mantener: [
          { id: "f1", texto: "Ubicación céntrica y accesible", tipo: "fortaleza", dimension: "Ubicación", asociado: "Juan Pérez" },
          { id: "f2", texto: "Comunidad organizada y participativa", tipo: "fortaleza", dimension: "Comunidad", asociado: "Ana Gómez" }
        ],
        explotar: [
          { id: "o1", texto: "Interés de inversores en el área", tipo: "oportunidad", dimension: "Inversión", asociado: "Carlos Ruiz" }
        ],
        corregir: [
          { id: "d1", texto: "Infraestructura envejecida", tipo: "debilidad", dimension: "Infraestructura", asociado: "María López" }
        ],
        afrontar: [
          { id: "a1", texto: "Gentrificación del barrio", tipo: "amenaza", dimension: "Desarrollo", asociado: "Pedro Sánchez" },
          { id: "a2", texto: "Cambio climático y eventos extremos", tipo: "amenaza", dimension: "Clima", asociado: "Lucía Torres" }
        ]
      },
      planesOperativos: [
        {
          id: "po2023",
          nombre: "Plan Operativo 2023",
          descripcion: "Plan anual para infraestructura",
          elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
          metas: [
            { id: "m1", nombre: "Realizar diagnóstico completo de infraestructura", cumplida: true },
            { id: "m2", nombre: "Implementar 2 espacios verdes", cumplida: false }
          ],
          anio: 2023
        },
        {
          id: "po2024",
          nombre: "Plan Operativo 2024",
          descripcion: "Plan anual para infraestructura 2024",
          elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
          metas: [
            { id: "m3", nombre: "Organizar charlas de concientización ambiental", cumplida: true },
            { id: "m4", nombre: "Instalar más basureros en espacios públicos", cumplida: false }
          ],
          anio: 2024
        }
      ]
    },
    {
      id: "2",
      nombre: "Fortalecer la educación en la comunidad",
      descripcion: "Establecer programas de apoyo escolar para niños y adolescentes, brindando acceso a materiales educativos y tutorías para mejorar su rendimiento académico.",
      elementosFoda: {
        mantener: [
          { id: "f3", texto: "Recursos municipales disponibles", tipo: "fortaleza", dimension: "Recursos", asociado: "Sofía Ramírez" }
        ],
        explotar: [
          { id: "o2", texto: "Fondos de desarrollo urbano disponibles", tipo: "oportunidad", dimension: "Recursos", asociado: "Miguel Castro" }
        ],
        corregir: [
          { id: "d2", texto: "Falta de espacios verdes", tipo: "debilidad", dimension: "Espacios Públicos", asociado: "Laura Jiménez" }
        ],
        afrontar: [
          { id: "a3", texto: "Cambios en políticas municipales", tipo: "amenaza", dimension: "Gestión", asociado: "Andrés Mora" }
        ]
      },
      planesOperativos: [
        {
          id: "po2023",
          nombre: "Plan Operativo 2023",
          descripcion: "Plan anual educativo",
          elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
          metas: [
            { id: "m5", nombre: "Capacitar a 50 estudiantes en el año", cumplida: true },
            { id: "m6", nombre: "Crear 3 clubes de lectura", cumplida: true },
            { id: "m7", nombre: "Organizar 2 ferias educativas", cumplida: false }
          ],
          anio: 2023
        }
      ]
    },
    {
      id: "3",
      nombre: "Impulsar el acceso a servicios de salud",
      descripcion: "Gestionar la construcción de una clínica comunitaria que proporcione atención médica básica, preventiva y emergente a los habitantes del barrio.",
      elementosFoda: {
        mantener: [
          { id: "f4", texto: "Red de voluntarios de salud", tipo: "fortaleza", dimension: "Salud", asociado: "Valeria Soto" }
        ],
        explotar: [
          { id: "o3", texto: "Programas estatales de salud", tipo: "oportunidad", dimension: "Salud Pública", asociado: "Roberto Vargas" }
        ],
        corregir: [
          { id: "d3", texto: "Falta de equipamiento médico", tipo: "debilidad", dimension: "Recursos", asociado: "Patricia Herrera" }
        ],
        afrontar: [
          { id: "a4", texto: "Enfermedades emergentes", tipo: "amenaza", dimension: "Salud", asociado: "Jorge Fernández" }
        ]
      },
      planesOperativos: [
        {
          id: "po2023",
          nombre: "Plan Operativo 2023",
          descripcion: "Plan anual de salud",
          elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
          metas: [
            { id: "m8", nombre: "Realizar 3 campañas de vacunación", cumplida: false },
            { id: "m9", nombre: "Capacitar a 20 voluntarios en primeros auxilios", cumplida: true }
          ],
          anio: 2023
        }
      ]
    },
    {
      id: "4",
      nombre: "Crear un centro cultural y recreativo",
      descripcion: "Iniciar la construcción de un centro comunitario que ofrezca actividades culturales, recreativas y deportivas para los jóvenes y adultos de la comunidad.",
      elementosFoda: {
        mantener: [
          { id: "f5", texto: "Interés de la comunidad", tipo: "fortaleza", dimension: "Cultura", asociado: "Gabriela Díaz" }
        ],
        explotar: [
          { id: "o4", texto: "Subvenciones culturales disponibles", tipo: "oportunidad", dimension: "Financiamiento", asociado: "Luis Martínez" }
        ],
        corregir: [
          { id: "d4", texto: "Espacio limitado para actividades", tipo: "debilidad", dimension: "Infraestructura", asociado: "Elena Navarro" }
        ],
        afrontar: [
          { id: "a5", texto: "Falta de participación juvenil", tipo: "amenaza", dimension: "Participación", asociado: "Tomás Rojas" }
        ]
      },
      planesOperativos: [
        {
          id: "po2023",
          nombre: "Plan Operativo 2023",
          descripcion: "Plan anual cultural",
          elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
          metas: [
            { id: "m10", nombre: "Organizar 5 eventos culturales", cumplida: false },
            { id: "m11", nombre: "Crear un club de teatro comunitario", cumplida: false }
          ],
          anio: 2023
        }
      ]
    },
    {
      id: "5",
      nombre: "Fomentar la seguridad y convivencia comunitaria",
      descripcion: "Implementar programas de vigilancia comunitaria y actividades de integración para reducir la delincuencia y mejorar la relación entre los vecinos.",
      elementosFoda: {
        mantener: [
          { id: "f6", texto: "Colaboración vecinal", tipo: "fortaleza", dimension: "Seguridad", asociado: "Natalia Pineda" }
        ],
        explotar: [
          { id: "o5", texto: "Apoyo policial", tipo: "oportunidad", dimension: "Seguridad", asociado: "Esteban Salas" }
        ],
        corregir: [
          { id: "d5", texto: "Falta de recursos para vigilancia", tipo: "debilidad", dimension: "Recursos", asociado: "Marcos Rivera" }
        ],
        afrontar: [
          { id: "a6", texto: "Aumento de la delincuencia", tipo: "amenaza", dimension: "Seguridad", asociado: "Daniela Vargas" }
        ]
      },
      planesOperativos: [
        {
          id: "po2023",
          nombre: "Plan Operativo 2023",
          descripcion: "Plan anual de seguridad",
          elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
          metas: [
            { id: "m12", nombre: "Capacitar a 10 líderes vecinales en prevención", cumplida: true },
            { id: "m13", nombre: "Organizar 2 jornadas de integración", cumplida: false }
          ],
          anio: 2023
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
    setShowForm(true);
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
              <th className="py-2 px-4">FODA Asociado</th>
              <th className="py-2 px-4">Metas cumplidas</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {objetivos.map((objetivo) => {
              // Sumar todas las metas de todos los planes operativos de todos los años asociadas a este objetivo
              const todasMetas = (objetivo.planesOperativos || []).flatMap(po => po.metas || []);
              const totalMetas = todasMetas.length;
              const metasCumplidas = todasMetas.filter(m => m.cumplida).length;
              // Agrupar FODA con valores por defecto
              const foda = objetivo.elementosFoda || { mantener: [], explotar: [], corregir: [], afrontar: [] };
              return (
                <tr key={objetivo.id} className="border-b">
                  <td className="py-2 px-4">{objetivo.nombre}</td>
                  <td className="py-2 px-4">{objetivo.descripcion}</td>
                  <td className="py-2 px-4">
                    <div className="mb-1">
                      <span className="font-semibold text-green-700 text-xs">Fortalezas:</span>
                      {foda.mantener.map(f => (
                        <span key={f.id} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs ml-1 inline-block mb-1">
                          {f.texto}
                          {f.asociado && (
                            <span className="ml-2 text-xs text-gray-500">({f.asociado})</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-blue-700 text-xs">Oportunidades:</span>
                      {foda.explotar.map(f => (
                        <span key={f.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs ml-1 inline-block mb-1">
                          {f.texto}
                          {f.asociado && (
                            <span className="ml-2 text-xs text-gray-500">({f.asociado})</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-yellow-700 text-xs">Debilidades:</span>
                      {foda.corregir.map(f => (
                        <span key={f.id} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs ml-1 inline-block mb-1">
                          {f.texto}
                          {f.asociado && (
                            <span className="ml-2 text-xs text-gray-500">({f.asociado})</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div>
                      <span className="font-semibold text-red-700 text-xs">Amenazas:</span>
                      {foda.afrontar.map(f => (
                        <span key={f.id} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs ml-1 inline-block mb-1">
                          {f.texto}
                          {f.asociado && (
                            <span className="ml-2 text-xs text-gray-500">({f.asociado})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4">{metasCumplidas} de {totalMetas}</td>
                  <td className="py-2 px-4 space-x-2">
                    <CustomButton size="sm" variant="outline" onClick={() => handleEdit(objetivo)}>Editar</CustomButton>
                    <CustomButton size="sm" variant="destructive" onClick={() => handleDelete(objetivo.id)}>Eliminar</CustomButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal/Formulario */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">
              {editObjetivo ? "Editar Objetivo Estratégico" : "Crear Objetivo Estratégico"}
            </h2>
            <div className="mb-2">
              <label className="block font-semibold mb-1">Nombre</label>
              <textarea className="w-full border rounded p-2 min-h-[100px]" rows={5} value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="mb-2">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea className="w-full border rounded p-2 min-h-[100px]" rows={5} value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Elementos FODA</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fortalezas */}
                <div>
                  <h3 className="font-semibold mb-2">Mantener Fortalezas</h3>
                  <Select
                    isMulti
                    options={elementosFodaDisponibles.filter(f => f.tipo === 'fortaleza').map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    value={elementosFoda.mantener.map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    onChange={selected => {
                      setElementosFoda(prev => ({
                        ...prev,
                        mantener: ((selected as any[])
                          .map(opt => elementosFodaDisponibles.find(f => f.id === opt.value))
                          .filter((f): f is FodaElement => Boolean(f)))
                      }));
                    }}
                    classNamePrefix="react-select"
                    placeholder="Seleccionar fortalezas..."
                  />
                </div>
                {/* Oportunidades */}
                <div>
                  <h3 className="font-semibold mb-2">Explotar Oportunidades</h3>
                  <Select
                    isMulti
                    options={elementosFodaDisponibles.filter(f => f.tipo === 'oportunidad').map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    value={elementosFoda.explotar.map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    onChange={selected => {
                      setElementosFoda(prev => ({
                        ...prev,
                        explotar: ((selected as any[])
                          .map(opt => elementosFodaDisponibles.find(f => f.id === opt.value))
                          .filter((f): f is FodaElement => Boolean(f)))
                      }));
                    }}
                    classNamePrefix="react-select"
                    placeholder="Seleccionar oportunidades..."
                  />
                </div>
                {/* Debilidades */}
                <div>
                  <h3 className="font-semibold mb-2">Corregir Debilidades</h3>
                  <Select
                    isMulti
                    options={elementosFodaDisponibles.filter(f => f.tipo === 'debilidad').map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    value={elementosFoda.corregir.map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    onChange={selected => {
                      setElementosFoda(prev => ({
                        ...prev,
                        corregir: ((selected as any[])
                          .map(opt => elementosFodaDisponibles.find(f => f.id === opt.value))
                          .filter((f): f is FodaElement => Boolean(f)))
                      }));
                    }}
                    classNamePrefix="react-select"
                    placeholder="Seleccionar debilidades..."
                  />
                </div>
                {/* Amenazas */}
                <div>
                  <h3 className="font-semibold mb-2">Afrontar Amenazas</h3>
                  <Select
                    isMulti
                    options={elementosFodaDisponibles.filter(f => f.tipo === 'amenaza').map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    value={elementosFoda.afrontar.map(f => ({ value: f.id, label: f.texto, asociado: f.asociado }))}
                    onChange={selected => {
                      setElementosFoda(prev => ({
                        ...prev,
                        afrontar: ((selected as any[])
                          .map(opt => elementosFodaDisponibles.find(f => f.id === opt.value))
                          .filter((f): f is FodaElement => Boolean(f)))
                      }));
                    }}
                    classNamePrefix="react-select"
                    placeholder="Seleccionar amenazas..."
                  />
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
            <div className="mb-4 md:col-span-2">
              <label className="block font-semibold mb-1">Planes Operativos Asociados</label>
              <ul className="mb-2">
                {(editObjetivo?.planesOperativos || []).map((po, idx) => (
                  <li key={po.id || idx} className="flex items-center gap-2 mb-1">
                    <span>{po.nombre} ({po.anio})</span>
                    <button type="button" className="text-blue-500" onClick={() => setEditPlanOperativo(po)}>Editar</button>
                  </li>
                ))}
              </ul>
              <button type="button" className="bg-green-500 text-white px-2 rounded" onClick={() => setEditPlanOperativo({ anio: new Date().getFullYear(), nombre: '', descripcion: '', metas: [], elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] } })}>Agregar Plan Operativo</button>
            </div>
            <PlanOperativoModal show={!!editPlanOperativo} onClose={() => setEditPlanOperativo(null)} plan={editPlanOperativo || undefined} onSave={po => {
              // Lógica para agregar/editar plan operativo en el objetivo actual
              if (editObjetivo) {
                const otros = (editObjetivo.planesOperativos || []).filter(p => p.anio !== po.anio);
                setEditObjetivo({ ...editObjetivo, planesOperativos: [...otros, po] });
              }
              setEditPlanOperativo(null);
            }} usedYears={(editObjetivo?.planesOperativos || []).map(p => p.anio)} />
            <div className="flex justify-end gap-2 md:col-span-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</CustomButton>
              <CustomButton type="submit">{editObjetivo ? "Aceptar" : "Crear Objetivo"}</CustomButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PlanOperativoModal({ show, onClose, plan, onSave, usedYears }: { show: boolean, onClose: () => void, plan?: PlanOperativo, onSave: (po: PlanOperativo) => void, usedYears: number[] }) {
  const [anio, setAnio] = useState(plan?.anio || new Date().getFullYear());
  const [nombre, setNombre] = useState(plan?.nombre || "");
  const [descripcion, setDescripcion] = useState(plan?.descripcion || "");
  const [metas, setMetas] = useState<Meta[]>(plan?.metas || []);
  const [editMeta, setEditMeta] = useState<Meta | null>(null);
  const [showMetaModal, setShowMetaModal] = useState(false);

  const handleSave = () => {
    if (!anio || !nombre) return;
    onSave({ ...plan, anio, nombre, descripcion, metas, elementosFoda: plan?.elementosFoda || { mantener: [], explotar: [], corregir: [], afrontar: [] } });
    onClose();
  };

  const handleAddMeta = () => {
    setEditMeta(null);
    setShowMetaModal(true);
  };
  const handleEditMeta = (meta: Meta) => {
    setEditMeta(meta);
    setShowMetaModal(true);
  };
  const handleSaveMeta = (meta: Meta) => {
    if (editMeta) {
      setMetas(metas.map(m => m === editMeta ? meta : m));
    } else {
      setMetas([...metas, meta]);
    }
    setShowMetaModal(false);
    setEditMeta(null);
  };
  const handleDeleteMeta = (meta: Meta) => {
    setMetas(metas.filter(m => m !== meta));
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{plan ? "Editar" : "Agregar"} Plan Operativo</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Año</label>
          <input type="number" className="w-full border rounded p-2" value={anio} min={2020} max={2100}
            onChange={e => setAnio(Number(e.target.value))}
            disabled={plan ? true : false} // No permitir cambiar año al editar
            list="years-list"
          />
          <datalist id="years-list">
            {[...Array(10)].map((_, i) => <option key={i} value={2020 + i} />)}
          </datalist>
          {usedYears.includes(anio) && !plan ? <div className="text-red-500 text-xs">Ya existe un plan para este año</div> : null}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Nombre</label>
          <input className="w-full border rounded p-2" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Descripción</label>
          <textarea className="w-full border rounded p-2" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Metas SMART</label>
          <ul className="mb-2">
            {metas.map((meta, idx) => (
              <li key={idx} className="flex items-center gap-2 mb-1">
                <span>{meta.nombre}</span>
                <button type="button" className="text-blue-500" onClick={() => handleEditMeta(meta)}>Editar</button>
                <button type="button" className="text-red-500" onClick={() => handleDeleteMeta(meta)}>Eliminar</button>
              </li>
            ))}
          </ul>
          <button type="button" className="bg-green-500 text-white px-2 rounded" onClick={handleAddMeta}>Agregar Meta</button>
        </div>
        <div className="flex justify-end gap-2">
          <CustomButton type="button" variant="outline" onClick={onClose}>Cancelar</CustomButton>
          <CustomButton type="button" onClick={handleSave}>{plan ? "Guardar" : "Agregar"}</CustomButton>
        </div>
        {/* Modal de Meta */}
        <MetaModal show={showMetaModal} onClose={() => setShowMetaModal(false)} meta={editMeta} onSave={handleSaveMeta} />
      </div>
    </div>
  );
}

function MetaModal({ show, onClose, meta, onSave }: { show: boolean, onClose: () => void, meta?: Meta, onSave: (m: Meta) => void }) {
  const [nombre, setNombre] = useState(meta?.nombre || "");
  const [cumplida, setCumplida] = useState(meta?.cumplida || false);
  const [indicadores, setIndicadores] = useState<string[]>(meta?.actividades || []);
  const [nuevoIndicador, setNuevoIndicador] = useState("");

  const handleSave = () => {
    if (!nombre) return;
    onSave({ ...meta, nombre, cumplida, actividades: indicadores });
  };
  const handleAddIndicador = () => {
    if (nuevoIndicador.trim()) {
      setIndicadores([...indicadores, nuevoIndicador.trim()]);
      setNuevoIndicador("");
    }
  };
  const handleRemoveIndicador = (idx: number) => {
    setIndicadores(indicadores.filter((_, i) => i !== idx));
  };
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{meta ? "Editar" : "Agregar"} Meta SMART</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Descripción de la meta</label>
          <input className="w-full border rounded p-2" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Indicadores</label>
          <ul className="mb-2">
            {indicadores.map((ind, idx) => (
              <li key={idx} className="flex items-center gap-2 mb-1">
                <span>{ind}</span>
                <button type="button" className="text-red-500" onClick={() => handleRemoveIndicador(idx)}>Eliminar</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mb-2">
            <input className="border rounded p-1 flex-1" placeholder="Nuevo indicador" value={nuevoIndicador} onChange={e => setNuevoIndicador(e.target.value)} />
            <button type="button" className="bg-blue-500 text-white px-2 rounded" onClick={handleAddIndicador}>Agregar</button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">¿Cumplida?</label>
          <input type="checkbox" checked={cumplida} onChange={e => setCumplida(e.target.checked)} />
        </div>
        <div className="flex justify-end gap-2">
          <CustomButton type="button" variant="outline" onClick={onClose}>Cancelar</CustomButton>
          <CustomButton type="button" onClick={handleSave}>{meta ? "Guardar" : "Agregar"}</CustomButton>
        </div>
      </div>
    </div>
  );
} 