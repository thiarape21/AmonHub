import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dataRoutes from './Rutas/DataRutas.js';
import supabase from './Configuracion/Supabase.js';

async function testDBConnection() {
    console.log('Verificando conexión a la base de datos...');

    const { data, error } = await supabase.from('Usuarios').select('*');

    if (error) {
        console.error('Error al conectar con la base de datos:', error.message);
    } else {
        console.log('✅ Conexión exitosa. Datos obtenidos:');
        console.table(data); // Imprime en formato tabla en la terminal
    }
}

testDBConnection();

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', dataRoutes);

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
