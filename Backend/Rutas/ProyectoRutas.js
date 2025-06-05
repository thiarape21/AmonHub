import express from 'express';
import { supabase } from '../Configuracion/Supabase.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// =============================================
// RUTAS PARA PROYECTOS
// =============================================

// Obtener todos los proyectos
router.get('/proyectos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Proyectos')
      .select('*, Tareas(*)');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un proyecto por ID
router.get('/proyectos/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Proyectos')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo proyecto
router.post('/proyectos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Proyectos')
      .insert([req.body])
      .select();
    
    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error en catch:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un proyecto existente
router.put('/proyectos/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Proyectos')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// RUTAS PARA TAREAS
// =============================================

// Obtener tareas de un proyecto
router.get('/proyectos/:id/tareas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Tareas')
      .select('*')
      .eq('proyecto_id', req.params.id);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva tarea para un proyecto
router.post('/proyectos/:id/tareas', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      proyecto_id: req.params.id
    };
    
    const { data, error } = await supabase
      .from('Tareas')
      .insert([taskData])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una tarea existente
router.put('/tareas/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Tareas')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    
    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.json(data[0]);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una tarea
router.delete('/tareas/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Tareas')
      .delete()
      .eq('id', req.params.id);
      
    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// RUTAS PARA OBJETIVOS SMART
// =============================================

// Obtener objetivos SMART de un proyecto
router.get('/proyectos/:id/objetivos-smart', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ObjetivosSmart')
      .select('*')
      .eq('proyecto_id', req.params.id);
    
    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear objetivos SMART para un proyecto
router.post('/proyectos/:id/objetivos-smart', async (req, res) => {
  try {
    const objetivosData = Array.isArray(req.body) ? req.body : [req.body];
    const objetivosWithProjectId = objetivosData.map(obj => ({
      ...obj,
      proyecto_id: req.params.id
    }));
    
    const { data, error } = await supabase
      .from('ObjetivosSmart')
      .insert(objetivosWithProjectId)
      .select();
    
    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar todos los objetivos SMART de un proyecto
router.delete('/proyectos/:id/objetivos-smart', async (req, res) => {
  try {
    const { error } = await supabase
      .from('ObjetivosSmart')
      .delete()
      .eq('proyecto_id', req.params.id);

    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un objetivo SMART específico
router.delete('/objetivos-smart/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('ObjetivosSmart')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// RUTAS PARA INDICADORES DE PROYECTO
// =============================================

// Obtener indicadores de un proyecto
router.get('/proyectos/:id/indicadores-proyecto', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('IndicadoresProyecto')
      .select('id, created_at, tipo, valor, proyecto_id')
      .eq('proyecto_id', req.params.id);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subir indicadores para un proyecto
router.post('/proyectos/:id/indicadores-proyecto', async (req, res) => {
  try {
    const fileData = req.body;
    const indicadoresData = Array.isArray(fileData) ? fileData.map(file => ({
      tipo: file.tipo,
      valor: file.valor,
      proyecto_id: req.params.id
    })) : [{
      tipo: fileData.tipo,
      valor: fileData.valor,
      proyecto_id: req.params.id
    }];

    const { data, error } = await supabase
      .from('IndicadoresProyecto')
      .insert(indicadoresData)
      .select();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un indicador de proyecto
router.delete('/indicadores-proyecto/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('IndicadoresProyecto')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// RUTAS PARA INDICADORES DE TAREAS
// =============================================

// Obtener indicadores de una tarea
router.get('/tareas/:id/indicadores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('IndicadoresProyectoT')
      .select('id, created_at, tipo, valor, tarea_id')
      .eq('tarea_id', req.params.id);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subir indicadores para una tarea
router.post('/tareas/:id/indicadores', async (req, res) => {
  try {
    const fileData = req.body;
    const indicadoresData = Array.isArray(fileData) ? fileData.map(file => ({
      tipo: file.tipo,
      valor: file.valor,
      tarea_id: req.params.id
    })) : [{
      tipo: fileData.tipo,
      valor: fileData.valor,
      tarea_id: req.params.id
    }];

    const { data, error } = await supabase
      .from('IndicadoresProyectoT')
      .insert(indicadoresData)
      .select();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un indicador de tarea
router.delete('/indicadores-tarea/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('IndicadoresProyectoT')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error en Supabase:', error);
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 