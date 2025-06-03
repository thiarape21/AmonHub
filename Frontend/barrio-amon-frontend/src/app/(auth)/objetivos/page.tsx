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
  associatedMetas?: AssociatedMeta[]; // New property for directly associated metas
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

interface AssociatedMeta { // New interface for directly associated metas
  id: string;
  description: string;
  isCompleted: boolean;
  isCanceled: boolean;
  cancelReason?: string;
}

interface Tarea {
  id?: string;
  nombre: string;
  cumplida: boolean;
}

// Mock data for FODA elements (should match the structure from analisis-foda/page.tsx)
const MOCK_FODA_DATA: FodaElement[] = [
  {
    id: "1",
    texto: "Ubicación estratégica en el centro de la ciudad",
    tipo: "fortaleza",
    dimension: "Ubicación"
  },
  {
    id: "2",
    texto: "Patrimonio histórico bien conservado",
    tipo: "fortaleza",
    dimension: "Patrimonio"
  },
  {
    id: "3",
    texto: "Falta de espacios de estacionamiento",
    tipo: "debilidad",
    dimension: "Infraestructura"
  },
  {
    id: "4",
    texto: "Potencial para desarrollo turístico",
    tipo: "oportunidad",
    dimension: "Turismo"
  },
  {
    id: "5",
    texto: "Aumento de la delincuencia en barrios aledaños",
    tipo: "amenaza",
    dimension: "Seguridad"
  },
];

// === Funciones para interactuar con API ===

async function getObjetivos(): Promise<Objetivo[]> {
  try {
    // TODO: Implement actual API fetch for objectives
    console.warn("Using mock data for objectives or actual API if available.");
    const res = await fetch("http://localhost:3030/api/objetivos", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000) // Add timeout
    });

    if (!res.ok) {
      // If API call fails, throw an error to be caught below and use mock data
      throw new Error(`Error fetching objectives: ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
        console.warn("API returned non-array data for objectives, using mock data.");
        return [
           {
            id: "1",
            nombre: "Mejorar la infraestructura básica del barrio",
            descripcion: "Renovar las calles principales y arreglar las aceras para asegurar una mejor movilidad y accesibilidad para todos los habitantes, especialmente personas con movilidad reducida.",
            elementosFoda: {
              mantener: [],
              explotar: [],
              corregir: [],
              afrontar: []
            },
             planesOperativos: []
          },
        ]; // Return minimal mock data if API returns unexpected format
    }
    return data;

  } catch (error) {
    console.error("Error fetching objectives, using mock data instead:", error);
    // Fallback to mock data for objectives if API fails or returns invalid data.
    // This structure shows nested planesOperativos and metas.
    return [
      {
        id: "1", // Mock ID
        nombre: "Mejorar la infraestructura básica del barrio",
        descripcion: "Renovar las calles principales y arreglar las aceras para asegurar una mejor movilidad y accesibilidad para todos los habitantes, especialmente personas con movilidad reducida.",
        elementosFoda: {
          mantener: [
            { id: "1", texto: "Ubicación estratégica en el centro de la ciudad", tipo: "fortaleza", dimension: "Ubicación" },
          ],
          explotar: [
            { id: "4", texto: "Potencial para desarrollo turístico", tipo: "oportunidad", dimension: "Turismo" }
          ],
          corregir: [
           { id: "3", texto: "Falta de espacios de estacionamiento", tipo: "debilidad", dimension: "Infraestructura" }
          ],
          afrontar: [
           { id: "5", texto: "Aumento de la delincuencia en barrios aledaños", tipo: "amenaza", dimension: "Seguridad" }
          ]
        },
        planesOperativos: [
          {
            id: "po2023", // Mock Plan Operativo ID
            nombre: "Plan Operativo 2023",
            descripcion: "Plan anual para infraestructura",
            elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] }, // FODA specific to the plan if needed, otherwise can be empty
            metas: [
              { id: "m1", nombre: "Realizar diagnóstico completo de infraestructura", cumplida: true, actividades: ['Diagnóstico completado'] }, // Mock Meta with activities
              { id: "m2", nombre: "Implementar 2 espacios verdes", cumplida: false, actividades: ['Identificar ubicaciones', 'Diseñar espacios'] }
            ],
            anio: 2023
          },
           {
            id: "po2024", // Another mock Plan Operativo
            nombre: "Plan Operativo 2024",
            descripcion: "Plan anual para educación",
            elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
            metas: [
              { id: "m3", nombre: "Organizar talleres comunitarios", cumplida: false, actividades: ['Planificar talleres'] }
            ],
            anio: 2024
           }
        ]
      },
       {
        id: "2", // Another mock Objective ID
        nombre: "Fortalecer la educación en la comunidad",
        descripcion: "Establecer programas de apoyo escolar para niños y adolescentes.",
         elementosFoda: {
          mantener: [
            { id: "2", texto: "Patrimonio histórico bien conservado", tipo: "fortaleza", dimension: "Patrimonio" },
          ],
          explotar: [
            { id: "4", texto: "Potencial para desarrollo turístico", tipo: "oportunidad", dimension: "Turismo" }
          ],
          corregir: [
             { id: "3", texto: "Falta de espacios de estacionamiento", tipo: "debilidad", dimension: "Infraestructura" }
          ],
          afrontar: [
             { id: "5", texto: "Aumento de la delincuencia en barrios aledaños", tipo: "amenaza", dimension: "Seguridad" }
          ]
        },
        planesOperativos: [
          {
            id: "po2024-edu", // Mock Plan Operativo ID
            nombre: "Plan Educativo 2024",
            descripcion: "Plan anual de programas educativos",
            elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
            metas: [
              { id: "m4", nombre: "Implementar programa de tutorías", cumplida: false, actividades: ['Definir tutores', 'Seleccionar estudiantes'] }
            ],
            anio: 2024
          }
        ]
       }
    ];
  }
}

async function getFodaElements(): Promise<FodaElement[]> {
  try {
    // TODO: Replace with actual API fetch for FODA elements
    console.warn("Using mock data for FODA elements or actual API if available.");
     const res = await fetch("http://localhost:3030/api/analisis-foda", {
       cache: "no-store",
       signal: AbortSignal.timeout(5000) // Add timeout
     });

     if (!res.ok) {
        throw new Error(`Error fetching FODA elements: ${res.statusText}`);
     }
     const data = await res.json();
      if (!Array.isArray(data)) {
         console.warn("API returned non-array data for FODA elements, using mock data.");
         return MOCK_FODA_DATA;
      }
      return data;
  } catch (error) {
    console.error("Error fetching FODA elements, using mock data instead:", error);
    // Fallback to hardcoded mock data in case of fetch error or API issues.
    // MOCK_FODA_DATA is defined at the top of the file.
    return MOCK_FODA_DATA;
  }
}

// TODO: Implement create, update, delete API functions for Objetivos
async function createObjetivo(objetivo: Omit<Objetivo, "id">): Promise<void> {
    try{
      console.log("Mock createObjetivo or actual API if available.", objetivo);
       // TODO: Implement actual API fetch for creating objetivo
       // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Assuming successful creation for now
    } catch (error) {
      console.error("Error creating objetivo:", error);
      // TODO: Show user feedback on error
    }
}

async function updateObjetivo(id: string, objetivo: Omit<Objetivo, "id">): Promise<void> {
    try{
       console.log("Mock updateObjetivo or actual API if available.", id, objetivo);
        // TODO: Implement actual API fetch for updating objetivo
       // Add artificial delay
       await new Promise(resolve => setTimeout(resolve, 500));
       // Assuming successful update for now
    } catch (error) {
      console.error("Error updating objetivo:", error);
      // TODO: Show user feedback on error
    }
}

async function deleteObjetivo(id: string): Promise<void> {
    try{
       console.log("Mock deleteObjetivo or actual API if available.", id);
        // TODO: Implement actual API fetch for deleting objetivo
       // Add artificial delay
       await new Promise(resolve => setTimeout(resolve, 500));
       // Assuming successful deletion for now
    } catch (error) {
      console.error("Error deleting objetivo:", error);
      // TODO: Show user feedback on error
    }
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [fodaElements, setFodaElements] = useState<FodaElement[]>([]);
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
  const [selectedMetas, setSelectedMetas] = useState<Meta[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; full_name: string }[]>([]);
  const [newAssociatedMetaDescription, setNewAssociatedMetaDescription] = useState('');
  const [formAssociatedMetas, setFormAssociatedMetas] = useState<AssociatedMeta[]>([]); // New state for associated metas in form

  // Derive all available metas from loaded objectives for the select options
  const allAvailableMetas = objetivos.flatMap(obj => (obj.planesOperativos || []).flatMap(po => po.metas || []));
  // Ensure uniqueness of metas if necessary, though react-select handles duplicate values based on 'value'
  const availableMetaOptions = allAvailableMetas.map(meta => ({ value: meta.id, label: meta.nombre }));

  // === Data Fetching Function ===
  async function fetchData() {
    // Comentamos las llamadas a la API para evitar el error 'TypeError: Failed to fetch' si el backend no está corriendo.
    // Descomentar estas secciones cuando el backend esté operativo.

    try {
      // // Fetch objectives
      // const objetivosRes = await fetch("http://localhost:3030/api/objetivos", {
      //   cache: "no-store",
      //   signal: AbortSignal.timeout(5000)
      // });

      // if (!objetivosRes.ok) throw new Error(`Error fetching objectives: ${objetivosRes.statusText}`);
      // const objetivosData = await objetivosRes.json();
      // if (Array.isArray(objetivosData)) setObjetivos(objetivosData);
      // else throw new Error("API returned non-array data for objectives");

      // Usar mock data directamente si las llamadas a la API están comentadas o fallan
      setObjetivos([
        {
          id: "1", // Mock ID
          nombre: "Mejorar la infraestructura básica del barrio",
          descripcion: "Renovar las calles principales y arreglar las aceras para asegurar una mejor movilidad y accesibilidad para todos los habitantes, especialmente personas con movilidad reducida.",
          elementosFoda: {
            mantener: [
              { id: "1", texto: "Ubicación estratégica en el centro de la ciudad", tipo: "fortaleza", dimension: "Ubicación" },
            ],
            explotar: [
              { id: "4", texto: "Potencial para desarrollo turístico", tipo: "oportunidad", dimension: "Turismo" }
            ],
            corregir: [
             { id: "3", texto: "Falta de espacios de estacionamiento", tipo: "debilidad", dimension: "Infraestructura" }
            ],
            afrontar: [
             { id: "5", texto: "Aumento de la delincuencia en barrios aledaños", tipo: "amenaza", dimension: "Seguridad" }
            ]
          },
          planesOperativos: [
            {
              id: "po2023", // Mock Plan Operativo ID
              nombre: "Plan Operativo 2023",
              descripcion: "Plan anual para infraestructura",
              elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] }, // FODA specific to the plan if needed, otherwise can be empty
              metas: [
                { id: "m1", nombre: "Realizar diagnóstico completo de infraestructura", cumplida: true, actividades: ['Diagnóstico completado'] }, // Mock Meta with activities
                { id: "m2", nombre: "Implementar 2 espacios verdes", cumplida: false, actividades: ['Identificar ubicaciones', 'Diseñar espacios'] }
              ],
              anio: 2023
            },
             {
              id: "po2024", // Another mock Plan Operativo
              nombre: "Plan Operativo 2024",
              descripcion: "Plan anual para educación",
              elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
              metas: [
                { id: "m3", nombre: "Organizar talleres comunitarios", cumplida: false, actividades: ['Planificar talleres'] }
              ],
              anio: 2024
             }
          ]
        },
         {
          id: "2", // Another mock Objective ID
          nombre: "Fortalecer la educación en la comunidad",
          descripcion: "Establecer programas de apoyo escolar para niños y adolescentes.",
           elementosFoda: {
            mantener: [
              { id: "2", texto: "Patrimonio histórico bien conservado", tipo: "fortaleza", dimension: "Patrimonio" },
            ],
            explotar: [
              { id: "4", texto: "Potencial para desarrollo turístico", tipo: "oportunidad", dimension: "Turismo" }
            ],
            corregir: [
             { id: "3", texto: "Falta de espacios de estacionamiento", tipo: "debilidad", dimension: "Infraestructura" }
            ],
            afrontar: [
             { id: "5", texto: "Aumento de la delincuencia en barrios aledaños", tipo: "amenaza", dimension: "Seguridad" }
            ]
          },
          planesOperativos: [
            {
              id: "po2024-edu", // Mock Plan Operativo ID
              nombre: "Plan Educativo 2024",
              descripcion: "Plan anual de programas educativos",
              elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] },
              metas: [
                { id: "m4", nombre: "Implementar programa de tutorías", cumplida: false, actividades: ['Definir tutores', 'Seleccionar estudiantes'] }
              ],
              anio: 2024
            }
          ]
         }
      ]);

    } catch (error) {
      console.error("Error fetching objectives:", error); // Mantener log por si acaso
      // Fallback to mock data already handled in try block
    }

    try {
      // // Fetch FODA elements
      // const fodaRes = await fetch("http://localhost:3030/api/analisis-foda", {
      //   cache: "no-store",
      //   signal: AbortSignal.timeout(5000)
      // });

      // if (!fodaRes.ok) throw new Error(`Error fetching FODA elements: ${fodaRes.statusText}`);
      // const fodaData = await fodaRes.json();
      // if (Array.isArray(fodaData)) setFodaElements(fodaData);
      // else throw new Error("API returned non-array data for FODA elements");

      // Usar mock data directamente
      setFodaElements(MOCK_FODA_DATA);

    } catch (error) {
      console.error("Error fetching FODA elements:", error); // Mantener log por si acaso
      // Fallback to mock data already handled in try block
    }

    try {
      // // Fetch users for responsible/collaborator dropdowns
      // const usersRes = await fetch("http://localhost:3030/api/usuarios", {
      //   cache: "no-store",
      //   signal: AbortSignal.timeout(5000)
      // });
      // if (!usersRes.ok) throw new Error(`Error fetching users: ${usersRes.statusText}`);
      // const usersData = await usersRes.json();
      // if (Array.isArray(usersData)) setUsuarios(usersData);
      // else throw new Error("API returned non-array data for users");

      // Usar mock data directamente
      setUsuarios([
        { id: "user1", full_name: "Juan Pérez" },
        { id: "user2", full_name: "Ana Gómez" },
        { id: "user3", full_name: "Carlos Ruiz" },
        { id: "user4", full_name: "María López" },
        { id: "user5", full_name: "Pedro Sánchez" },
        { id: "user6", full_name: "Lucía Torres" },
      ]);

    } catch (error) {
      console.error("Error fetching users:", error); // Mantener log por si acaso
      // Fallback to mock data already handled in try block
    }
  }

  // === Effect Hook for Initial Data Fetching ===
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this effect runs only once on mount


  // Options for react-select dropdowns, filtered by type
  const fortalezaOptions = fodaElements
    .filter(f => f.tipo === 'fortaleza')
    .map(f => ({ value: f.id, label: f.texto }));

  const oportunidadOptions = fodaElements
    .filter(f => f.tipo === 'oportunidad')
    .map(f => ({ value: f.id, label: f.texto }));

  const debilidadOptions = fodaElements
    .filter(f => f.tipo === 'debilidad')
    .map(f => ({ value: f.id, label: f.texto }));

  const amenazaOptions = fodaElements
    .filter(f => f.tipo === 'amenaza')
    .map(f => ({ value: f.id, label: f.texto }));

  const resetForm = () => {
    setEditObjetivo(null);
    setEditPlanOperativo(null); // Also reset plan editing state
    setNombre("");
    setDescripcion("");
    setElementosFoda({ mantener: [], explotar: [], corregir: [], afrontar: [] });
    setResponsable("");
    setColaboradores("");
    setMetas([]); // Assuming metas are associated with plans, not directly with objective form
    setFormAssociatedMetas([]); // Reset associated metas form state
  };

   const handleAddPlanOperativo = () => {
    // This will open the Plan Operativo modal
    setEditPlanOperativo({ anio: new Date().getFullYear(), nombre: '', descripcion: '', metas: [], elementosFoda: { mantener: [], explotar: [], corregir: [], afrontar: [] } });
  };

  const handleSavePlanOperativo = (po: PlanOperativo) => {
    if (editObjetivo) {
      // Add or update the plan in the current objective's plans array
      const existingIndex = (editObjetivo.planesOperativos || []).findIndex(p => p.id === po.id);
      let updatedPlans;
      if (existingIndex > -1) {
        updatedPlans = [...editObjetivo.planesOperativos || []];
        updatedPlans[existingIndex] = po;
      } else {
        updatedPlans = [...editObjetivo.planesOperativos || [], { ...po, id: Date.now().toString() }]; // Add with temp ID if new
      }
      setEditObjetivo({ ...editObjetivo, planesOperativos: updatedPlans });
    } else {
      // If adding a plan before creating the objective, maybe store it temporarily?
      console.warn("Plan added before objective creation. Not saving plan.");
      // TODO: Handle adding plans before the objective is created
    }
    setEditPlanOperativo(null);
  };

  const handleEditPlanOperativo = (po: PlanOperativo) => {
    setEditPlanOperativo(po);
    // No need to set objective form state here, modal handles plan details
  };

  const handleDeletePlanOperativo = (poToDelete: PlanOperativo) => {
    if (!editObjetivo) return;
    if (!confirm("¿Seguro que deseas eliminar este plan operativo?")) return;
    setEditObjetivo(prev => {
      if (!prev) return null;
      return {
        ...prev,
        planesOperativos: (prev.planesOperativos || []).filter(po => po.id !== poToDelete.id)
      };
    });
  };

  // Filtered list of plans to display in the objective form for editing
  const associatedPlans = editObjetivo?.planesOperativos || [];

    // Handlers for the main objective form
   const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseObjetivo = {
      nombre,
      descripcion,
      elementosFoda,
      responsable,
      colaboradores,
    };

    if (editObjetivo) {
      // Update existing objective
      const updatedObjetivo = {
        ...editObjetivo,
        ...baseObjetivo,
        // associatedMetas are already updated via setEditObjetivo in handlers
      };
      await updateObjetivo(editObjetivo.id!, updatedObjetivo);
    } else {
      // Create new objective
      const nuevoObjetivo: Omit<Objetivo, "id"> = {
        ...baseObjetivo,
        planesOperativos: [], // New objectives start with no nested plans
        associatedMetas: formAssociatedMetas, // Include associated metas from form state
      };
      await createObjetivo(nuevoObjetivo);
    }

    fetchData(); // Refresh data after save
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (objetivo: Objetivo) => {
    setEditObjetivo(objetivo);
    setNombre(objetivo.nombre);
    setDescripcion(objetivo.descripcion);
    // Populate the form with existing FODA elements for editing, ensuring arrays exist
    setElementosFoda({
      mantener: objetivo.elementosFoda?.mantener || [],
      explotar: objetivo.elementosFoda?.explotar || [],
      corregir: objetivo.elementosFoda?.corregir || [],
      afrontar: objetivo.elementosFoda?.afrontar || [],
    });
    setResponsable(objetivo.responsable || "");
    setColaboradores(objetivo.colaboradores || "");
    // When editing, initialize formAssociatedMetas with the objective's associatedMetas
    setFormAssociatedMetas(objetivo.associatedMetas || []);
    setShowForm(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("¿Seguro que deseas eliminar este objetivo?")) return;
    try {
      await deleteObjetivo(id);
      await fetchData(); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting objetivo:", error);
      // TODO: Show user feedback on delete error
    }
  };

  const handleAddAssociatedMeta = () => {
    if (newAssociatedMetaDescription.trim()) {
      const newMeta: AssociatedMeta = {
        id: `am-${Date.now()}`, // Generate a temporary ID
        description: newAssociatedMetaDescription.trim(),
        isCompleted: false,
        isCanceled: false,
      };
      if (editObjetivo) {
        setEditObjetivo(prev => {
          if (!prev) return null;
          return {
            ...prev,
            associatedMetas: [...(prev.associatedMetas || []), newMeta]
          };
        });
      } else {
        setFormAssociatedMetas(prev => [...prev, newMeta]); // Removed || []
      }
      setNewAssociatedMetaDescription('');
    }
  };

  const handleAssociatedMetaCompletionToggle = (metaId: string) => {
    if (editObjetivo) {
      setEditObjetivo(prev => {
        if (!prev) return null;
        const currentMetas = prev.associatedMetas || [];
        const updatedMetas = currentMetas.map(meta =>
          meta.id === metaId
            ? { ...meta, isCompleted: !meta.isCompleted, isCanceled: false, cancelReason: undefined } // Mark complete/incomplete, ensure not canceled
            : meta
        );
        return { ...prev, associatedMetas: updatedMetas };
      });
    } else {
      setFormAssociatedMetas(prev => {
        const currentMetas = Array.isArray(prev) ? prev : []; // Ensure currentMetas is always an array
        const updatedMetas = currentMetas.map(meta =>
          meta.id === metaId
            ? { ...meta, isCompleted: !meta.isCompleted, isCanceled: false, cancelReason: undefined } // Mark complete/incomplete, ensure not canceled
            : meta
        );
        return updatedMetas;
      });
    }
  };

  const handleAssociatedMetaCancellation = (metaId: string) => {
     if (editObjetivo) {
      setEditObjetivo(prev => {
        if (!prev) return null;
        const currentMetas = prev.associatedMetas || [];
         const updatedMetas = currentMetas.map(meta =>
          meta.id === metaId
            ? { ...meta, isCanceled: true, isCompleted: false } // Mark canceled, ensure not completed
            : meta
        );
        return { ...prev, associatedMetas: updatedMetas };
      });
    } else {
      setFormAssociatedMetas(prev => {
        const currentMetas = Array.isArray(prev) ? prev : []; // Ensure currentMetas is always an array
         const updatedMetas = currentMetas.map(meta =>
           meta.id === metaId
            ? { ...meta, isCanceled: true, isCompleted: false } // Mark canceled, ensure not completed
            : meta
        );
        return updatedMetas;
      });
    }
  };

  const handleAssociatedMetaReasonChange = (metaId: string, reason: string) => {
     if (editObjetivo) {
      setEditObjetivo(prev => {
         if (!prev) return null;
         const currentMetas = prev.associatedMetas || [];
         const updatedMetas = currentMetas.map(meta =>
           meta.id === metaId ? { ...meta, cancelReason: reason } : meta
        );
        return { ...prev, associatedMetas: updatedMetas };
      });
     } else {
      setFormAssociatedMetas(prev => {
         const currentMetas = Array.isArray(prev) ? prev : []; // Ensure currentMetas is always an array
         const updatedMetas = currentMetas.map(meta =>
           meta.id === metaId ? { ...meta, cancelReason: reason } : meta
        );
        return updatedMetas;
      });
     }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b70]">OBJETIVOS ESTRATÉGICOS</h1>

      <div className="flex justify-end mb-4">
        <CustomButton onClick={() => {
          setShowForm(true);
          resetForm(); // Reset form for new objective
        }}>
          Agregar Objetivo Estratégico
        </CustomButton>
      </div>

      {/* Table of Objectives */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-[#4A6670] text-white">
              <th className="border border-gray-300 py-2 px-4 text-left">Nombre</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Descripción</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Metas (Cumplidas/Totales)</th>
              <th className="border border-gray-300 py-2 px-4 text-left">FODA Asociado</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Responsable</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Colaboradores</th>
              <th className="border border-gray-300 py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {objetivos.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-gray-300 py-2 px-4 text-center text-gray-500 italic">No hay objetivos estratégicos registrados.</td>
              </tr>
            ) : (
              objetivos.map((objetivo) => {
                // Calculate completed/total count based on directly associated metas
                const associatedMetas = objetivo.associatedMetas || [];
                const totalMetas = associatedMetas.length;
                const metasCumplidas = associatedMetas.filter(meta => meta.isCompleted && !meta.isCanceled).length;

                // Group FODA with default empty arrays if null/undefined
                const foda = objetivo.elementosFoda || { mantener: [], explotar: [], corregir: [], afrontar: [] };

                return (
                  <tr key={objetivo.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 py-2 px-4 font-medium">{objetivo.nombre}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{objetivo.descripcion}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{metasCumplidas}/{totalMetas}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      {/* Display associated FODA elements */}
                      {(() => {
                        const safeFoda = objetivo.elementosFoda || { mantener: [], explotar: [], corregir: [], afrontar: [] };
                        return (
                          <>
                            {safeFoda.mantener && Array.isArray(safeFoda.mantener) && safeFoda.mantener.length > 0 && (
                               <div><strong>Mantener Fortalezas:</strong> {safeFoda.mantener.map(f => f?.texto).filter(Boolean).join(", ")}</div>
                            )}
                             {safeFoda.explotar && Array.isArray(safeFoda.explotar) && safeFoda.explotar.length > 0 && (
                               <div><strong>Explotar Oportunidades:</strong> {safeFoda.explotar.map(o => o?.texto).filter(Boolean).join(", ")}</div>
                            )}
                             {safeFoda.corregir && Array.isArray(safeFoda.corregir) && safeFoda.corregir.length > 0 && (
                               <div><strong>Corregir Debilidades:</strong> {safeFoda.corregir.map(d => d?.texto).filter(Boolean).join(", ")}</div>
                            )}
                             {safeFoda.afrontar && Array.isArray(safeFoda.afrontar) && safeFoda.afrontar.length > 0 && (
                               <div><strong>Afrontar Amenazas:</strong> {safeFoda.afrontar.map(a => a?.texto).filter(Boolean).join(", ")}</div>
                            )}
                          </>
                        );
                      })()}
                      {!objetivo.elementosFoda || (objetivo.elementosFoda.mantener?.length === 0 && objetivo.elementosFoda.explotar?.length === 0 && objetivo.elementosFoda.corregir?.length === 0 && objetivo.elementosFoda.afrontar?.length === 0) && (
                        '-N/A-'
                      )}
                    </td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{objetivo.responsable || 'N/A'}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">{objetivo.colaboradores || 'N/A'}</td>
                    <td className="border border-gray-300 py-2 px-4 text-sm">
                      <CustomButton variant="outline" size="sm" onClick={() => handleEdit(objetivo)} className="mr-2">Editar</CustomButton>
                      <CustomButton variant="destructive" size="sm" onClick={() => handleDelete(objetivo.id)}>Eliminar</CustomButton>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal/Formulario Crear/Editar Objetivo */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]"> {/* Added max-h and overflow-y for scrolling */}
            <h2 className="text-2xl font-bold mb-4">{editObjetivo ? "Editar Objetivo Estratégico" : "Crear Objetivo Estratégico"}</h2>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Nombre</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Descripción</label>
              <textarea
                className="w-full border rounded p-2"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Elementos FODA</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fortalezas */}
                  <div>
                    <h3 className="font-semibold mb-2">Mantener Fortalezas</h3>
                    <Select
                      isMulti
                      options={fortalezaOptions}
                     value={elementosFoda.mantener.map(f => ({ value: f.id, label: f.texto }))}
                      onChange={selected => {
                        setElementosFoda(prev => ({
                          ...prev,
                          mantener: ((selected as any[])
                           .map(opt => fodaElements.find(f => f.id === opt.value))
                            .filter((f): f is FodaElement => Boolean(f)))
                        }));
                      }}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Seleccionar fortalezas..."
                    />
                  </div>
                  {/* Oportunidades */}
                  <div>
                    <h3 className="font-semibold mb-2">Explotar Oportunidades</h3>
                    <Select
                      isMulti
                      options={oportunidadOptions}
                      value={elementosFoda.explotar.map(f => ({ value: f.id, label: f.texto }))}
                      onChange={selected => {
                        setElementosFoda(prev => ({
                          ...prev,
                          explotar: ((selected as any[])
                           .map(opt => fodaElements.find(f => f.id === opt.value))
                            .filter((f): f is FodaElement => Boolean(f)))
                        }));
                      }}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Seleccionar oportunidades..."
                    />
                  </div>
                  {/* Debilidades */}
                  <div>
                    <h3 className="font-semibold mb-2">Corregir Debilidades</h3>
                    <Select
                      isMulti
                      options={debilidadOptions}
                      value={elementosFoda.corregir.map(f => ({ value: f.id, label: f.texto }))}
                      onChange={selected => {
                        setElementosFoda(prev => ({
                          ...prev,
                          corregir: ((selected as any[])
                           .map(opt => fodaElements.find(f => f.id === opt.value))
                            .filter((f): f is FodaElement => Boolean(f)))
                        }));
                      }}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Seleccionar debilidades..."
                    />
                  </div>
                  {/* Amenazas */}
                  <div>
                    <h3 className="font-semibold mb-2">Afrontar Amenazas</h3>
                    <Select
                      isMulti
                      options={amenazaOptions}
                      value={elementosFoda.afrontar.map(f => ({ value: f.id, label: f.texto }))}
                      onChange={selected => {
                        setElementosFoda(prev => ({
                          ...prev,
                          afrontar: ((selected as any[])
                           .map(opt => fodaElements.find(f => f.id === opt.value))
                            .filter((f): f is FodaElement => Boolean(f)))
                        }));
                      }}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Seleccionar amenazas..."
                    />
                  </div>
                </div>
              </div>

              {/* Responsible and Collaborators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block font-semibold mb-1">Responsable</label>
                  {/* TODO: Replace with actual user select */}
                  <select
                    className="w-full border rounded p-2"
                    value={responsable}
                    onChange={e => setResponsable(e.target.value)}
                  >
                    <option value="">Selecciona un responsable</option>
                    {/* Example options - replace with fetched users */}
                    {usuarios.map(user => (
                       <option key={user.id} value={user.full_name}>{user.full_name}</option>
                    ))}
                    {/* Fallback static options if users not loaded */}
                    {usuarios.length === 0 && (
                      <>
                        <option value="Juan Pérez">Juan Pérez</option>
                        <option value="Ana Gómez">Ana Gómez</option>
                        <option value="Carlos Ruiz">Carlos Ruiz</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Colaboradores</label>
                   {/* Using a simple select for now, ideally would be a multi-select with tags */}
                   <select
                    className="w-full border rounded p-2"
                     value={colaboradores} // This currently only supports selecting one
                     onChange={e => setColaboradores(e.target.value)} // This will only set the last selected
                  >
                    <option value="">Agregar colaborador...</option>
                     {/* Example options - replace with fetched users */}
                     {usuarios.map(user => (
                       <option key={user.id} value={user.full_name}>{user.full_name}</option>
                    ))}
                    {/* Fallback static options if users not loaded */}
                    {usuarios.length === 0 && (
                      <>
                       <option value="María López">María López</option>
                        <option value="Pedro Sánchez">Pedro Sánchez</option>
                       <option value="Lucía Torres">Lucía Torres</option>
                      </>
                    )}
                  </select>
                   {/* TODO: Display selected collaborators as tags with remove functionality */}
                   {colaboradores && (
                     <div className="mt-2">
                       <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                          {colaboradores}
                          {/* Remove button - currently removes the single selected collaborator */}
                         <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => setColaboradores("")}>
                            ×
                          </button>
                        </span>
                     </div>
                   )}
                </div>
              </div>

              {/* Metas Asociadas Selector */}
              <div className="mb-4 mt-4">
                <label className="block font-semibold mb-1">Metas Asociadas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="border rounded p-2 flex-1"
                    placeholder="Agregar meta asociada..."
                    value={newAssociatedMetaDescription}
                    onChange={e => setNewAssociatedMetaDescription(e.target.value)}
                  />
                  <CustomButton type="button" onClick={handleAddAssociatedMeta}>Agregar</CustomButton>
                </div>
                <ul className="list-disc list-inside">
                  {(editObjetivo?.associatedMetas && Array.isArray(editObjetivo.associatedMetas) ? editObjetivo.associatedMetas : formAssociatedMetas && Array.isArray(formAssociatedMetas) ? formAssociatedMetas : []).map((meta, idx) => (
                     <li key={meta.id || idx} className="flex flex-col gap-2 border-b last:border-b-0 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={meta.isCompleted}
                            onChange={() => handleAssociatedMetaCompletionToggle(meta.id)}
                            className="form-checkbox"
                          />
                          <span className={`text-sm ${meta.isCompleted ? 'line-through text-gray-500' : ''} ${meta.isCanceled ? 'line-through text-red-500' : ''}`}>
                            {meta.description}
                          </span>
                        </div>
                        {/* Only show cancel button if editing and not completed/canceled */}
                        {editObjetivo && !meta.isCompleted && !meta.isCanceled && (
                           <CustomButton variant="destructive" size="sm" onClick={() => handleAssociatedMetaCancellation(meta.id)}>Cancelar Meta</CustomButton>
                        )}
                         {/* Show canceled label if canceled */}
                         {meta.isCanceled && (
                           <span className="text-red-500 text-xs">Cancelada</span>
                         )}
                      </div>
                      {/* Show reason input if canceled and editing */}
                      {editObjetivo && meta.isCanceled && (
                        <div className="ml-6">
                          <label className="block font-semibold mb-1 text-sm">Razón de Cancelación:</label>
                          <textarea
                            className="w-full border rounded p-1 text-sm"
                            value={meta.cancelReason || ''}
                            onChange={(e) => handleAssociatedMetaReasonChange(meta.id, e.target.value)}
                            rows={2}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                   {(!(editObjetivo?.associatedMetas && Array.isArray(editObjetivo.associatedMetas) ? editObjetivo.associatedMetas : formAssociatedMetas && Array.isArray(formAssociatedMetas) ? formAssociatedMetas : []).length && <li className="text-sm text-gray-500">- No hay metas asociadas agregadas -</li>)}
                </ul>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <CustomButton type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </CustomButton>
                <CustomButton type="submit">
                  {editObjetivo ? "Guardar Cambios" : "Crear Objetivo"}
                </CustomButton>
              </div>
            </form>
          </div>
        )}

        {/* Plan Operativo Modal */}
         {editPlanOperativo && (
            <PlanOperativoModal
              show={!!editPlanOperativo}
              onClose={() => setEditPlanOperativo(null)}
              plan={editPlanOperativo}
              onSave={handleSavePlanOperativo}
              usedYears={objetivos.flatMap(obj => obj.planesOperativos || []).map(po => po.anio).filter((year): year is number => year !== undefined)}
            />
         )}

      </div>
    );
  }

function PlanOperativoModal({ show, onClose, plan, onSave, usedYears }: { show: boolean, onClose: () => void, plan?: PlanOperativo | null, onSave: (po: PlanOperativo) => void, usedYears: number[] }) {
  const [anio, setAnio] = useState(plan?.anio || new Date().getFullYear());
  const [nombre, setNombre] = useState(plan?.nombre || "");
  const [descripcion, setDescripcion] = useState(plan?.descripcion || "");
  const [metas, setMetas] = useState<Meta[]>(plan?.metas || []);
  const [editMeta, setEditMeta] = useState<Meta | undefined>(undefined);
  const [showMetaModal, setShowMetaModal] = useState(false);

  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5).filter(year => !usedYears.includes(year) || year === plan?.anio).sort((a,b) => a-b);

  useEffect(() => {
    if (plan) {
      setAnio(plan.anio);
      setNombre(plan.nombre);
      setDescripcion(plan.descripcion);
      setMetas(plan.metas || []);
    } else {
      resetForm();
    }
  }, [plan]);

  const resetForm = () => {
    setAnio(new Date().getFullYear());
    setNombre('');
    setDescripcion('');
    setMetas([]);
  };

  const handleSave = () => {
    if (!nombre || !descripcion || anio === 0) return;

    const savedPlan: PlanOperativo = {
      id: plan?.id,
      nombre,
      descripcion,
      anio: anio as number,
      metas,
      elementosFoda: plan?.elementosFoda || { mantener: [], explotar: [], corregir: [], afrontar: [] },
    };
    onSave(savedPlan);
    resetForm();
  };

  const handleAddMeta = () => {
    setEditMeta(undefined);
    setShowMetaModal(true);
  };

  const handleEditMeta = (meta: Meta) => {
    setEditMeta(meta);
    setShowMetaModal(true);
  };

  const handleSaveMeta = (meta: Meta) => {
    setMetas(prev => {
      const existingIndex = prev.findIndex(m => m.id === meta.id);
      if (existingIndex > -1) {
        const updatedMetas = [...prev];
        updatedMetas[existingIndex] = meta;
        return updatedMetas;
      } else {
        return [...prev, { ...meta, id: Date.now().toString() }];
      }
    });
    setShowMetaModal(false);
    setEditMeta(undefined);
  };

  const handleDeleteMeta = (meta: Meta) => {
    if (!confirm("¿Seguro que deseas eliminar esta meta?")) return;
    setMetas(prev => prev.filter(m => m.id !== meta.id));
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm ${show ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{plan ? 'Editar' : 'Agregar'} Plan Operativo</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Año</label>
          <input type="number" className="w-full border rounded p-2" value={anio} min={2020} max={2100}
            onChange={e => setAnio(Number(e.target.value))}
            disabled={plan ? true : false}
            list="years-list"
          />
          <datalist id="years-list">
            {availableYears.map((year) => (
              <option key={year} value={year} />
            ))}
          </datalist>
          {usedYears.includes(Number(anio)) && !plan ? <div className="text-red-500 text-xs">Ya existe un plan para este año</div> : null}
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
        {showMetaModal && (
          <MetaModal show={showMetaModal} onClose={() => setShowMetaModal(false)} meta={editMeta} onSave={handleSaveMeta} />
        )}
      </div>
    </div>
  );
}

function MetaModal({ show, onClose, meta, onSave }: { show: boolean, onClose: () => void, meta?: Meta | undefined, onSave: (m: Meta) => void }) {
  const [nombre, setNombre] = useState(meta?.nombre || "");
  const [cumplida, setCumplida] = useState(meta?.cumplida || false);
  const [indicadores, setIndicadores] = useState<string[]>(meta?.actividades || []);
  const [nuevoIndicador, setNuevoIndicador] = useState("");

  useEffect(() => {
    if (meta) {
      setNombre(meta.nombre);
      setCumplida(meta.cumplida);
      setIndicadores(meta.actividades || []);
    } else {
      resetForm();
    }
  }, [meta]);

  const resetForm = () => {
    setNombre('');
    setCumplida(false);
    setIndicadores([]);
  };

  const handleSave = () => {
    if (!nombre) return;
    const savedMeta: Meta = {
      id: meta?.id,
      nombre,
      cumplida,
      actividades: indicadores,
    };
    onSave(savedMeta);
    resetForm();
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

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm ${show ? '' : 'hidden'}`}>
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