import express from "express";
import { supabase } from "../Configuracion/Supabase.js"; // Asegúrate de tener la configuración adecuada

const router = express.Router();

// Ruta para subir archivos PDF
router.post("/upload-pdf", async (req, res) => {
  try {
    // Verifica si se ha recibido un archivo en el body
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({
        message: "No se ha recibido un archivo PDF.",
      });
    }

    const pdf = req.files.pdf; // Asegúrate de usar un middleware como `express-fileupload` para manejar archivos

    // Subir el archivo al bucket "archivos"
    const { data, error } = await supabase
      .storage
      .from('archivos')
      .upload(`proyectos/pdfs/${pdf.name}`, pdf.data, { upsert: true });

    if (error) {
      return res.status(400).json({
        message: "Error al subir el archivo.",
        error: error.message,
      });
    }

    // Obtener la URL pública del archivo subido
    const { publicURL, error: urlError } = await supabase
      .storage
      .from('archivos')
      .getPublicUrl(`proyectos/pdfs/${pdf.name}`);

    if (urlError) {
      return res.status(400).json({
        message: "Error al obtener la URL pública.",
        error: urlError.message,
      });
    }

    // Responder con la URL del archivo
    res.status(200).json({
      message: "Archivo subido correctamente",
      fileUrl: publicURL,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

export default router;
