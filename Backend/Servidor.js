import express from "express";
import cors from "cors";
import fileUpload from 'express-fileupload';
import dotenv from "dotenv";
import dataRoutes from "./Rutas/DataRutas.js";
import authRoutes from "./Rutas/AuthRutas.js";
import { supabase } from "./Configuracion/Supabase.js";

dotenv.config();

async function testDBConnection() {
  console.log("Verificando conexión a la base de datos...");

  const { data, error } = await supabase.from("Usuarios").select("*"); // ✅ Corrección: minúsculas

  if (error) {
    console.error("Error al conectar con la base de datos:", error.message);
  } else {
    console.log("✅ Conexión exitosa. Datos obtenidos:");
    console.log(data);
  }

  const { data2, error2 } = await supabase.from("AnalisisFoda").select("*"); // ✅ Corrección: minúsculas

  if (error2) {
    console.error("Error al conectar con la base de datos:", error2.message);
  } else {
    console.log("✅ Conexión exitosa. Datos obtenidos:");
    console.log(data2);
  }
}

testDBConnection();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.use("/api", dataRoutes);
app.use("/api/auth", authRoutes);

app.listen(3030, () => console.log("Servidor en http://localhost:3030"));
