import express from "express";
import { supabase, supabaseAdmin } from "../Configuracion/Supabase.js";

const router = express.Router();

router.get("/analisis-foda", async (req, res) => {
  const { data, error } = await supabase.from("AnalisisFoda").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/datos", async (req, res) => {
  const { data, error } = await supabase.from("Usuarios").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


router.get("/usuarios/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("Usuarios")
    .select("*")
    .eq("user_id", user_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get("/usuarios", async (req, res) => {
  try {
    const { data, error } = await supabase.from("Usuarios").select(`
        *,
        role:Roles(*)
      `);

    if (error) {
      return res.status(500).json({
        message: "Error al obtener usuarios",
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

router.get("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("Usuarios")
      .select(
        `
        *,
        role:Roles(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

router.post("/usuarios", async (req, res) => {
  try {
    const { user_id, role_id, email, full_name } = req.body;

    const { data, error } = await supabase
      .from("Usuarios")
      .insert([{ user_id, role_id, email, full_name }])
      .select(
        `
        *,
        role:Roles(*)
      `
      )
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al crear usuario",
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

router.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, email, full_name } = req.body;

    const { data, error } = await supabase
      .from("Usuarios")
      .update({ role_id, email, full_name })
      .eq("id", id)
      .select(
        `
        *,
        role:Roles(*)
      `
      )
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al actualizar usuario",
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

router.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First get the user_id from the Usuarios table
    const { data: user, error: userError } = await supabase
      .from("Usuarios")
      .select("user_id")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        error: userError?.message,
      });
    }

    // Delete from Usuarios table
    const { error: deleteError } = await supabase
      .from("Usuarios")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return res.status(400).json({
        message: "Error al eliminar usuario de la base de datos",
        error: deleteError.message,
      });
    }

    // Delete from auth.users using admin client
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      user.user_id
    );

    if (authError) {
      // Log the error but don't fail the request since the user is already deleted from Usuarios
      console.error("Error al eliminar usuario de auth:", authError.message);
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

/*
// CRUD Proyectos
router.get("/proyectos", async (req, res) => {
  const { data, error } = await supabase.from("proyectos").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get("/proyectos/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("proyectos").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

router.post("/proyectos", async (req, res) => {
  const proyecto = req.body;
  const { data, error } = await supabase.from("proyectos").insert([proyecto]).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put("/proyectos/:id", async (req, res) => {
  const { id } = req.params;
  const proyecto = req.body;
  const { data, error } = await supabase.from("proyectos").update(proyecto).eq("id", id).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete("/proyectos/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("Proyectos").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});
*/
// Obtener todos los objetivos (con metas asociadas)
// Obtener todos los objetivos (con metas asociadas)
router.get("/objetivos", async (req, res) => {
  const { data: objetivos, error } = await supabase
    .from("Objetivos")
    .select("*");

  if (error) return res.status(400).json({ error: error.message });

  const { data: metas, error: metasError } = await supabase
    .from("Metas_Asignadas") // nombre correcto
    .select("id, objetivos_id, nombre, completado");

  if (metasError) return res.status(400).json({ error: metasError.message });

  const objetivosConMetas = objetivos.map(obj => ({
    ...obj,
    associatedMetas: metas
      .filter(m => m.objetivos_id === obj.id)
      .map(m => ({
        id: m.id,
        description: m.nombre,
        isCompleted: m.completado === 1,
        isCanceled: false,
        cancelReason: null,
      }))
  }));

  res.json(objetivosConMetas);
});


// Obtener un objetivo específico
router.get("/objetivos/:id", async (req, res) => {
  const { id } = req.params;

  const { data: objetivo, error } = await supabase
    .from("Objetivos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: error.message });

  const { data: metas, error: metasError } = await supabase
    .from("Metas_Asignadas")
    .select("id, nombre, completado")
    .eq("objetivos_id", id);

  if (metasError) return res.status(400).json({ error: metasError.message });

  objetivo.associatedMetas = metas.map(m => ({
    id: m.id,
    description: m.nombre,
    isCompleted: m.completado === 1,
    isCanceled: false,
    cancelReason: null,
  }));

  res.json(objetivo);
});


// Crear objetivo y metas
router.post("/objetivos", async (req, res) => {
  const {
    nombre,
    descripcion,
    analisisfoda_id,
    responsable_id,
    colaboradores,
    metas_asociadas = []
  } = req.body;

  const { data: objetivo, error: insertError } = await supabase
    .from("Objetivos")
    .insert([{ nombre, descripcion, analisisfoda_id, responsable_id, colaboradores }])
    .select()
    .single();

  if (insertError) return res.status(400).json({ error: insertError.message });

  if (metas_asociadas.length > 0) {
    const metas = metas_asociadas.map(meta => ({
      objetivos_id: objetivo.id,
      nombre: meta.description,
      completado: meta.isCompleted ? 1 : 0
    }));

    const { error: metasError } = await supabase
      .from("Metas_Asignadas")
      .insert(metas);

    if (metasError) return res.status(400).json({ error: metasError.message });
  }

  res.status(201).json(objetivo);
});


// Actualizar objetivo y metas
router.put("/objetivos/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    analisisfoda_id,
    responsable_id,
    colaboradores,
    metas_asociadas = []
  } = req.body;

  const { data: objetivo, error: updateError } = await supabase
    .from("Objetivos")
    .update({ nombre, descripcion, analisisfoda_id, responsable_id, colaboradores })
    .eq("id", id)
    .select()
    .single();

  if (updateError) return res.status(400).json({ error: updateError.message });

  await supabase.from("Metas_Asignadas").delete().eq("objetivos_id", id);

  if (metas_asociadas.length > 0) {
    const metas = metas_asociadas.map(meta => ({
      objetivos_id: id,
      nombre: meta.description,
      completado: meta.isCompleted ? 1 : 0
    }));

    const { error: metasError } = await supabase
      .from("Metas_Asignadas")
      .insert(metas);

    if (metasError) return res.status(400).json({ error: metasError.message });
  }

  res.json(objetivo);
});


// Eliminar objetivo (y sus metas)
router.delete("/objetivos/:id", async (req, res) => {
  const { id } = req.params;

  await supabase.from("Metas_Asignadas").delete().eq("objetivos_id", id);

  const { error } = await supabase
    .from("Objetivos")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});


// CRUD ObjetivosSmart
// Obtener todos los objetivos SMART de un proyecto
/*
router.get("/proyectos/:id/objetivos-smart", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("ObjetivosSmart")
      .select("*")
      .eq("proyecto_id", id);

    if (error) {
      return res.status(400).json({ 
        message: "Error al obtener objetivos SMART",
        error: error.message 
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Crear objetivos SMART para un proyecto
router.post("/proyectos/:id/objetivos-smart", async (req, res) => {
  try {
    const { id } = req.params;
    const objetivos = req.body;

    // Asegurarse de que cada objetivo tenga el proyecto_id correcto
    const objetivosConProyectoId = Array.isArray(objetivos) 
      ? objetivos.map(obj => ({ ...obj, proyecto_id: parseInt(id) }))
      : [{ ...objetivos, proyecto_id: parseInt(id) }];

    const { data, error } = await supabase
      .from("ObjetivosSmart")
      .insert(objetivosConProyectoId)
      .select();

    if (error) {
      return res.status(400).json({
        message: "Error al crear objetivos SMART",
        error: error.message
      });
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});
*/
// Actualizar un objetivo SMART
router.put("/objetivos-smart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, cumplida } = req.body;

    const { data, error } = await supabase
      .from("ObjetivosSmart")
      .update({ nombre, descripcion, cumplida })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al actualizar objetivo SMART",
        error: error.message
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Eliminar un objetivo SMART
router.delete("/objetivos-smart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("ObjetivosSmart")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Error al eliminar objetivo SMART",
        error: error.message
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

/*
// CRUD PDFs
// Obtener todos los PDFs de un proyecto
router.get("/proyectos/:id/pdfs", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("Pdfs")
      .select("*")
      .eq("proyecto_id", id);

    if (error) {
      return res.status(400).json({
        message: "Error al obtener PDFs",
        error: error.message
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Subir PDFs para un proyecto
router.post("/proyectos/:id/pdfs", async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files; // Asumiendo que usas multer o similar para manejar archivos

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No se proporcionaron archivos"
      });
    }

    const pdfsToInsert = files.map(file => ({
      nombre: file.originalname,
      url: file.path, // Ajusta esto según cómo manejes el almacenamiento de archivos
      proyecto_id: parseInt(id)
    }));

    const { data, error } = await supabase
      .from("Pdfs")
      .insert(pdfsToInsert)
      .select();

    if (error) {
      return res.status(400).json({
        message: "Error al guardar PDFs",
        error: error.message
      });
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Eliminar un PDF
router.delete("/pdfs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("Pdfs")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Error al eliminar PDF",
        error: error.message
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});*/

// Obtener todos los elementos FODA
router.get("/analisis-foda", async (req, res) => {
  try {
    const { data, error } = await supabase.from("AnalisisFoda").select("*");

    if (error) {
      return res.status(500).json({ message: "Error al obtener análisis FODA", error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Obtener un solo elemento FODA por ID
router.get("/analisis-foda/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("AnalisisFoda")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ message: "Elemento FODA no encontrado", error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Crear un nuevo elemento FODA
router.post("/analisis-foda", async (req, res) => {
  const { texto, tipo, dimension, meta } = req.body;

  if (!texto || !tipo || !dimension) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const { data, error } = await supabase
      .from("AnalisisFoda")
      .insert([{ texto, tipo, dimension, meta }])
      .select("*")
      .single();

    if (error) {
      return res.status(400).json({ message: "Error al crear elemento FODA", error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Actualizar un elemento FODA
router.put("/analisis-foda/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, tipo, dimension, meta } = req.body;

  try {
    const { data, error } = await supabase
      .from("AnalisisFoda")
      .update({ texto, tipo, dimension, meta })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return res.status(400).json({ message: "Error al actualizar elemento FODA", error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// Eliminar un elemento FODA
router.delete("/analisis-foda/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("AnalisisFoda").delete().eq("id", id);

    if (error) {
      return res.status(400).json({ message: "Error al eliminar elemento FODA", error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

// CRUD Metas

// ============================================
// PLAN OPERATIVO - RUTAS COMPLETAS
// ============================================

// CRUD METAS CON RELACIONES COMPLETAS

// Obtener todas las metas con sus relaciones
router.get("/metas", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Metas")
      .select(`
        *,
        responsable:Usuarios!responsable_id(id, full_name),
        objetivos:Objetivos_X_Metas(
          objetivo:Objetivos(id, nombre)
        ),
        actividades:Actividades(*),
        indicadores:Indicadores(*)
      `);

    if (error) {
      return res.status(500).json({
        message: "Error al obtener metas",
        error: error.message
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Obtener una meta específica con todas sus relaciones
router.get("/metas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("Metas")
      .select(`
        *,
        responsable:Usuarios!responsable_id(id, full_name),
        objetivos:Objetivos_X_Metas(
          objetivo:Objetivos(id, nombre)
        ),
        actividades:Actividades(*),
        indicadores:Indicadores(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        message: "Meta no encontrada",
        error: error.message
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Crear nueva meta con objetivos y actividades
router.post("/metas", async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      responsable_id, 
      fecha_inicio, 
      fecha_fin, 
      objetivos, 
      actividades,
      indicadores 
    } = req.body;

    // Validaciones básicas
    if (!descripcion || !responsable_id || !fecha_fin) {
      return res.status(400).json({
        message: "Faltan campos requeridos: descripcion, responsable_id, fecha_fin"
      });
    }

    // Crear la meta
    const { data: meta, error: metaError } = await supabase
      .from("Metas")
      .insert([{
        nombre,
        descripcion,
        responsable_id,
        fecha_inicio,
        fecha_fin
      }])
      .select()
      .single();

    if (metaError) {
      return res.status(400).json({
        message: "Error al crear meta",
        error: metaError.message
      });
    }

    // Asociar objetivos si se proporcionaron
    if (objetivos && objetivos.length > 0) {
      const objetivosData = objetivos.map(objetivo_id => ({
        meta_id: meta.id,
        objetivo_id: objetivo_id
      }));

      const { error: objetivosError } = await supabase
        .from("Objetivos_X_Metas")
        .insert(objetivosData);

      if (objetivosError) {
        console.error("Error al asociar objetivos:", objetivosError.message);
      }
    }

    // Crear actividades si se proporcionaron
    if (actividades && actividades.length > 0) {
      const actividadesData = actividades.map(actividad => ({
        description: actividad.description,
        meta_id: meta.id,
        isCompleted: false,
        isCanceled: false
      }));

      const { error: actividadesError } = await supabase
        .from("Actividades")
        .insert(actividadesData);

      if (actividadesError) {
        console.error("Error al crear actividades:", actividadesError.message);
      }
    }

    // Crear indicadores si se proporcionaron
    if (indicadores && indicadores.length > 0) {
      const indicadoresData = indicadores.map(indicador => ({
        meta_id: meta.id,
        tipo: indicador.type,
        valor: indicador.value
      }));

      const { error: indicadoresError } = await supabase
        .from("Indicadores")
        .insert(indicadoresData);

      if (indicadoresError) {
        console.error("Error al crear indicadores:", indicadoresError.message);
      }
    }

    // Obtener la meta completa con todas las relaciones
    const { data: metaCompleta, error: fetchError } = await supabase
      .from("Metas")
      .select(`
        *,
        responsable:Usuarios!responsable_id(id, full_name),
        objetivos:Objetivos_X_Metas(
          objetivo:Objetivos(id, nombre)
        ),
        actividades:Actividades(*),
        indicadores:Indicadores(*)
      `)
      .eq("id", meta.id)
      .single();

    if (fetchError) {
      return res.status(201).json(meta); // Devolver meta básica si falla el fetch completo
    }

    res.status(201).json(metaCompleta);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Actualizar meta existente
router.put("/metas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      descripcion, 
      responsable_id, 
      fecha_inicio, 
      fecha_fin, 
      objetivos,
      actividades,
      indicadores 
    } = req.body;

    // Actualizar la meta
    const { data: meta, error: metaError } = await supabase
      .from("Metas")
      .update({
        nombre,
        descripcion,
        responsable_id,
        fecha_inicio,
        fecha_fin
      })
      .eq("id", id)
      .select()
      .single();

    if (metaError) {
      return res.status(400).json({
        message: "Error al actualizar meta",
        error: metaError.message
      });
    }

    // Actualizar objetivos asociados
    if (objetivos !== undefined) {
      // Eliminar asociaciones existentes
      await supabase
        .from("Objetivos_X_Metas")
        .delete()
        .eq("meta_id", id);

      // Crear nuevas asociaciones
      if (objetivos.length > 0) {
        const objetivosData = objetivos.map(objetivo_id => ({
          meta_id: parseInt(id),
          objetivo_id: objetivo_id
        }));

        await supabase
          .from("Objetivos_X_Metas")
          .insert(objetivosData);
      }
    }

    // Obtener la meta actualizada con todas las relaciones
    const { data: metaCompleta, error: fetchError } = await supabase
      .from("Metas")
      .select(`
        *,
        responsable:Usuarios!responsable_id(id, full_name),
        objetivos:Objetivos_X_Metas(
          objetivo:Objetivos(id, nombre)
        ),
        actividades:Actividades(*),
        indicadores:Indicadores(*)
      `)
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.json(meta);
    }

    res.json(metaCompleta);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Eliminar meta y todas sus relaciones
router.delete("/metas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar en orden debido a foreign keys
    // 1. Indicadores
    await supabase.from("Indicadores").delete().eq("meta_id", id);
    
    // 2. Actividades
    await supabase.from("Actividades").delete().eq("meta_id", id);
    
    // 3. Objetivos asociados
    await supabase.from("Objetivos_X_Metas").delete().eq("meta_id", id);
    
    // 4. Meta
    const { error } = await supabase.from("Metas").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Error al eliminar meta",
        error: error.message
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// ============================================
// ACTIVIDADES
// ============================================

// Obtener actividades de una meta específica
router.get("/metas/:id/actividades", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("Actividades")
      .select("*")
      .eq("meta_id", id);

    if (error) {
      return res.status(500).json({
        message: "Error al obtener actividades",
        error: error.message
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Crear nueva actividad para una meta
router.post("/metas/:id/actividades", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        message: "La descripción de la actividad es requerida"
      });
    }

    const { data, error } = await supabase
      .from("Actividades")
      .insert([{
        description,
        meta_id: parseInt(id),
        isCompleted: false,
        isCanceled: false
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al crear actividad",
        error: error.message
      });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Actualizar actividad (completar, cancelar, etc.)
router.put("/actividades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isCompleted, isCanceled, cancelReason } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (isCanceled !== undefined) updateData.isCanceled = isCanceled;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;

    const { data, error } = await supabase
      .from("Actividades")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al actualizar actividad",
        error: error.message
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Eliminar actividad
router.delete("/actividades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("Actividades")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Error al eliminar actividad",
        error: error.message
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// ============================================
// INDICADORES
// ============================================

// Obtener indicadores de una meta específica
router.get("/metas/:id/indicadores", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("Indicadores")
      .select("*")
      .eq("meta_id", id);

    if (error) {
      return res.status(500).json({
        message: "Error al obtener indicadores",
        error: error.message
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Crear nuevo indicador para una meta
router.post("/metas/:id/indicadores", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, valor } = req.body;

    if (!tipo || !valor) {
      return res.status(400).json({
        message: "Tipo y valor del indicador son requeridos"
      });
    }

    if (!['link', 'file'].includes(tipo)) {
      return res.status(400).json({
        message: "Tipo de indicador debe ser 'link' o 'file'"
      });
    }

    const { data, error } = await supabase
      .from("Indicadores")
      .insert([{
        meta_id: parseInt(id),
        tipo,
        valor
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: "Error al crear indicador",
        error: error.message
      });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

// Eliminar indicador
router.delete("/indicadores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("Indicadores")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Error al eliminar indicador",
        error: error.message
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
});

export default router;
