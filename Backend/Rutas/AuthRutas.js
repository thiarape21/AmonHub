import express from "express";
import { supabase } from "../Configuracion/Supabase.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son requeridos" });
  }

  try {
    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // No enviar la contraseña al cliente
    const { password: _, ...userWithoutPassword } = data;

    res.json({
      message: "Login exitoso",
      user: userWithoutPassword,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

// Nuevo endpoint para registro de usuarios
router.post("/register", async (req, res) => {
  const { user_id, full_name, email } = req.body;

  if (!user_id || !full_name || !email) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    // Crear nuevo usuario
    const { data, error } = await supabase
      .from("Usuarios")
      .insert([
        {
          user_id,
          full_name,
          email,
        },
      ])
      .select();

    if (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error al registrar usuario",
        error: error.message,
      });
    }

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});




router.get("/usuarios", async (req, res) => {
  try {
    const { data, error } = await supabase.from("Usuarios").select("*");

    if (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener usuarios", error: error.message });
    }

    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

router.get("/analisis-foda", async (req, res) => {
  try {
    const { data, error } = await supabase.from("AnalisisFoda").select("*");

    if (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener análisis FODA", error: error.message });
    }

    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

router.post("/analisis-foda", async (req, res) => {
  const { texto, tipo, dimension, meta } = req.body;

  // Validación mínima
  if (!texto || !tipo || !dimension) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  const { error } = await supabase.from("AnalisisFoda").insert([
    { texto, tipo, dimension, meta }
  ]);

  if (error) {
    return res.status(500).json({ message: "Error al crear FODA", error: error.message });
  }

  res.status(201).json({ message: "Elemento FODA creado correctamente" });
});

export default router;
