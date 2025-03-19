import express from "express";
import supabase from "../Configuracion/Supabase.js"; // ✅ Corrección

const router = express.Router();

router.post("/login", async (req, res) => {
    const { correo, contrasena } = req.body;

    console.log("Datos recibidos en el login:");
    console.log("Correo:", correo);
    console.log("Contraseña:", contrasena);

    const { data, error } = await supabase
        .from("Usuarios")
        .select("*")
        .eq("correo", correo)
        .eq("contrasena", contrasena)
        .single();

    console.log("Respuesta de Supabase:", data, error);

    if (error || !data) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({
        message: "Login exitoso",
        user: data
    });
});


// 🔹 Ruta para obtener todos los usuarios
router.get("/usuarios", async (req, res) => {
    const { data, error } = await supabase.from("Usuarios").select("*"); // ✅ Corrección: minúsculas

    if (error) {
        return res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }

    res.json(data);
});

export default router;
