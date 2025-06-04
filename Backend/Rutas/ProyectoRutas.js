import express from 'express';
import { supabase } from '../Configuracion/Supabase.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all projects
router.get('/proyectos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Proyectos')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single project by ID
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

// Create a new project
router.post('/proyectos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Proyectos')
      .insert([req.body])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Catch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a project
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

// Get project tasks
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

// Create a task for a project
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

// Update a task
router.put('/tareas/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Tareas')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project SMART objectives
router.get('/proyectos/:id/objetivos-smart', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ObjetivosSmart')
      .select('*')
      .eq('proyecto_id', req.params.id);
    
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create SMART objectives for a project
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
      console.error('Supabase error:', error);
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload PDFs for a project
router.post('/proyectos/:id/pdfs', upload.array('pdfs'), async (req, res) => {
  try {
    const files = req.files;
    const pdfsData = files.map(file => ({
      nombre: file.originalname,
      url: file.path,
      proyecto_id: req.params.id
    }));
    
    const { data, error } = await supabase
      .from('pdfs')
      .insert(pdfsData)
      .select();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project PDFs
router.get('/proyectos/:id/pdfs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('proyecto_id', req.params.id);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 