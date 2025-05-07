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


// CRUD Objetivos
// Obtener todos los objetivos
router.get("/objetivos", async (req, res) => {
  const { data, error } = await supabase
    .from("Objetivos")
    .select("id, nombre, descripcion");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Obtener un objetivo específico por ID
router.get("/objetivos/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("Objetivos")
    .select("id, nombre, descripcion")
    .eq("id", id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// Crear un nuevo objetivo
router.post("/objetivos", async (req, res) => {
  const { nombre, descripcion } = req.body;
  const { data, error } = await supabase
    .from("Objetivos")
    .insert([{ nombre, descripcion }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Actualizar un objetivo existente
router.put("/objetivos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const { data, error } = await supabase
    .from("Objetivos")
    .update({ nombre, descripcion })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Eliminar un objetivo
router.delete("/objetivos/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("Objetivos").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// CRUD ObjetivosSmart
// Obtener todos los objetivos SMART de un proyecto
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
});

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



export default router;
