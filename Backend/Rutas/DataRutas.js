import express from 'express';
import supabase from '../Configuracion/Supabase.js'; // ✅ Corrección

const router = express.Router();

router.get('/datos', async (req, res) => {
    const { data, error } = await supabase.from('Usuarios').select('*'); // ✅ Corrección: minúsculas
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

export default router;
