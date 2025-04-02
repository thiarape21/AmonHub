import express from "express";
import { supabase, supabaseAdmin } from "../Configuracion/Supabase.js";

const router = express.Router();

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

export default router;
