import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dataRoutes from './Rutas/DataRutas.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', dataRoutes);

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
