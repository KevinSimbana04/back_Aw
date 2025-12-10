// src/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mealRoutes from './routers/mealRoutes.js'; 
import routerEstudiante from './routers/estudianteRoutes.js';

// Inicializaciones
const app = express();
dotenv.config(); 

// Middlewares
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las solicitudes
app.use(cors()); 

// Variables globales
app.set('port', process.env.PORT || 3000); // Define el puerto del servidor

// Monta las rutas de comidas bajo el prefijo /api/meals
app.use('/api/meals', mealRoutes); 

app.get('/', (req, res) => {
    res.send('Servidor de Recetas TheMealDB funcionando. Prueba /api/meals/random o /api/meals/search?name=chicken');
});


app.get('/',(req,res)=>res.send("Server on"))

// Rutas para veterinarios
app.use('/api',routerEstudiante)

// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(404).send("Endpoint no encontrado - 404"))

// Exportar la instancia de express por medio de app
export default app;