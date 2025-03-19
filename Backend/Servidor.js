import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dataRoutes from './Rutas/DataRutas.js';
import authRoutes from './Rutas/AuthRutas.js';
import supabase from './Configuracion/Supabase.js';

dotenv.config(); // ✅ Mantenerlo aquí

async function testDBConnection() {
    console.log('Verificando conexión a la base de datos...');

    const { data, error } = await supabase.from('Usuarios').select('*'); // ✅ Corrección: minúsculas

    if (error) {
        console.error('Error al conectar con la base de datos:', error.message);
    } else {
        console.log('✅ Conexión exitosa. Datos obtenidos:');
        console.log(data);
    }
}

testDBConnection();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', dataRoutes);
app.use('/api/auth', authRoutes);

app.listen(5000, () => console.log('Servidor en http://localhost:5000'));
