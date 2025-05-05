"use client";
import { useEffect, useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";

interface Objetivo {
  id?: string;
  nombre: string;
  descripcion: string;
  tipo?: string; // 'estrategico' | 'operativo'
  foda?: string;
  responsable?: string;
  colaboradores?: string;
  plazo_inicio?: string;
  plazo_fin?: string;
  estado_inicial?: string;
  proyectos_asociados?: string[];
  metas?: Meta[];
}

interface Meta {
  id?: string;
  nombre: string;
  cumplida: boolean;
  actividades?: string[];
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editObjetivo, setEditObjetivo] = useState<Objetivo | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [foda, setFoda] = useState("");
  const [responsable, setResponsable] = useState("");
  const [colaboradores, setColaboradores] = useState("");
  const [plazoInicio, setPlazoInicio] = useState("");
  const [plazoFin, setPlazoFin] = useState("");
  const [estadoInicial, setEstadoInicial] = useState("");
  const [proyectosAsociados, setProyectosAsociados] = useState<string[]>([]);
  const [proyectos, setProyectos] = useState<{ id: string; nombre: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; full_name: string }[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);

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

    fetch("http://localhost:3030/api/proyectos")
      .then((res) => {
        if (!res.ok) throw new Error(`Error fetching proyectos: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProyectos(data);
        else setProyectos([]);
      })
      .catch((error) => console.error("Failed to fetch proyectos:", error));

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
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const objetivo: Objetivo = {
      nombre,
      descripcion,
      tipo,
      foda,
      responsable,
      colaboradores,
      plazo_inicio: plazoInicio,
      plazo_fin: plazoFin,
      estado_inicial: estadoInicial,
      proyectos_asociados: tipo === "operativo" ? proyectosAsociados : [],
      metas: tipo === "operativo" ? metas : [],
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
      setNombre("");
      setDescripcion("");
      setTipo("");
      setFoda("");
      setResponsable("");
      setColaboradores("");
      setPlazoInicio("");
      setPlazoFin("");
      setEstadoInicial("");
      setProyectosAsociados([]);
      setMetas([]);
      // Refrescar lista
      fetch("http://localhost:3030/api/objetivos")
        .then((res) => res.json())
        .then((data) => Array.isArray(data) && setObjetivos(data));
    }
  };

  const handleEdit = (objetivo: Objetivo) => {
    setEditObjetivo(objetivo);
    setNombre(objetivo.nombre);
    setDescripcion(objetivo.descripcion);
    setTipo(objetivo.tipo || "");
    setFoda(objetivo.foda || "");
    setResponsable(objetivo.responsable || "");
    setColaboradores(objetivo.colaboradores || "");
    setPlazoInicio(objetivo.plazo_inicio || "");
    setPlazoFin(objetivo.plazo_fin || "");
    setEstadoInicial(objetivo.estado_inicial || "");
    setProyectosAsociados(objetivo.proyectos_asociados || []);
    setMetas(objetivo.metas || []);
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">OBJETIVOS ESTRATÉGICOS</h1>
      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => { setShowForm(true); setEditObjetivo(null); setNombre(""); setDescripcion(""); setTipo(""); setFoda(""); setResponsable(""); setColaboradores(""); setPlazoInicio(""); setPlazoFin(""); setEstadoInicial(""); setProyectosAsociados([]); setMetas([]); }}>Crear Objetivo</CustomButton>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-[#4A6670] text-white">
            <tr>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Descripción</th>
              <th className="py-2 px-4">Proyectos asociados</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {objetivos.map((objetivo) => (
              <tr key={objetivo.id} className="border-b">
                <td className="py-2 px-4">{objetivo.nombre}</td>
                <td className="py-2 px-4">{objetivo.descripcion}</td>
                <td className="py-2 px-4">
                  {objetivo.proyectos_asociados && objetivo.proyectos_asociados.length > 0
                    ? objetivo.proyectos_asociados.map(pid => {
                        const p = proyectos.find(proj => proj.id === pid);
                        return p ? p.nombre : <span className="text-gray-400 italic" key={pid}>Desconocido</span>;
                      }).join(", ")
                    : <span className="text-gray-400 italic">Ninguno</span>}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <CustomButton size="sm" variant="outline" onClick={() => handleEdit(objetivo)}>Editar</CustomButton>
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
            <h2 className="text-2xl font-bold mb-4 md:col-span-2">{editObjetivo ? "Editar Objetivo" : "Crear Objetivo"}</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Nombre</label>
              <input className="w-full border rounded p-2" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea className="w-full border rounded p-2" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block font-semibold mb-1">Tipo de objetivo</label>
              <select
                className="w-full border rounded p-2"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                required
              >
                <option value="">Selecciona el tipo de objetivo</option>
                <option value="estrategico">Estratégico (largo plazo, 10 años)</option>
                <option value="operativo">Operativo (corto plazo, 1 año)</option>
              </select>
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block font-semibold mb-1">FODA</label>
              <textarea className="w-full border rounded p-2" value={foda} onChange={e => setFoda(e.target.value)} placeholder="(Pendiente de ligar estructura FODA)" />
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
              <div className="text-xs text-gray-500">Solo puede haber un responsable por objetivo.</div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Colaboradores</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colaboradoresArray.map((colab) => (
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
                {usuarios.filter(u => u.full_name !== responsable && !colaboradoresArray.includes(u.full_name)).map((u) => (
                  <option key={u.id} value={u.full_name}>{u.full_name}</option>
                ))}
              </select>
              <div className="text-xs text-gray-500">Selecciona uno o varios colaboradores registrados.</div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Plazo de inicio</label>
              <input type="date" className="w-full border rounded p-2" value={plazoInicio} onChange={e => setPlazoInicio(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Plazo de fin</label>
              <input type="date" className="w-full border rounded p-2" value={plazoFin} onChange={e => setPlazoFin(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Estado inicial</label>
              <select
                className="w-full border rounded p-2"
                value={estadoInicial}
                onChange={e => setEstadoInicial(e.target.value)}
              >
                <option value="">Selecciona un estado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completado">Completado</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
            {/* Solo mostrar estos campos si es operativo */}
            {tipo === "operativo" && (
              <>
                <div className="mb-4 md:col-span-2">
                  <label className="block font-semibold mb-1">Proyectos asociados</label>
                  <select
                    multiple
                    className="w-full border rounded p-2"
                    value={proyectosAsociados}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setProyectosAsociados(options);
                    }}
                    disabled={proyectos.length === 0}
                  >
                    {proyectos.length === 0 ? (
                      <option value="">No hay proyectos creados, primero debes crear un proyecto.</option>
                    ) : (
                      <>
                        <option value="">Sin proyectos asociados</option>
                        {proyectos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="text-xs text-gray-500">
                    {proyectos.length === 0
                      ? "No hay proyectos disponibles."
                      : "Puedes dejarlo vacío si aún no hay proyectos asociados."}
                  </div>
                </div>
                {/* Gestión de metas */}
                <div className="mb-4 md:col-span-2">
                  <label className="block font-semibold mb-1">Metas</label>
                  <MetaManager metas={metas} setMetas={setMetas} />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 md:col-span-2">
              <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</CustomButton>
              <CustomButton type="submit">{editObjetivo ? "Guardar" : "Crear"}</CustomButton>
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
  const [actividades, setActividades] = useState<string[]>([]);

  const handleAddMeta = () => {
    if (nuevaMeta.trim() !== "") {
      setMetas([...metas, { nombre: nuevaMeta, cumplida: false, actividades }]);
      setNuevaMeta("");
      setActividades([]);
    }
  };
  const handleCheckMeta = (idx: number) => {
    setMetas(metas.map((m, i) => i === idx ? { ...m, cumplida: !m.cumplida } : m));
  };
  const handleRemoveMeta = (idx: number) => {
    setMetas(metas.filter((_, i) => i !== idx));
  };
  const handleAddActividad = () => {
    if (nuevaActividad.trim() !== "") {
      setActividades([...actividades, nuevaActividad]);
      setNuevaActividad("");
    }
  };
  const handleRemoveActividad = (idx: number) => {
    setActividades(actividades.filter((_, i) => i !== idx));
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
          placeholder="Nueva meta"
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
      <ul className="mb-2 ml-4">
        {actividades.map((act, idx) => (
          <li key={idx} className="text-xs flex items-center gap-1">
            - {act}
            <button type="button" className="text-red-500" onClick={() => handleRemoveActividad(idx)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 