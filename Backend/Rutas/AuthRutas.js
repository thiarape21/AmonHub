import express from "express";
import supabase from "../Configuracion/Supabase.js";

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
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    // Verificar si el correo ya está registrado
    const { data: existingUser } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Este correo ya está registrado" });
    }

    // Crear nuevo usuario
    const { data, error } = await supabase
      .from("Usuarios")
      .insert([
        {
          nombre: fullName,
          email,
          password,
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

    // No enviar la contraseña al cliente
    const userResponse = data[0];
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: userWithoutPassword,
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

export default router;
