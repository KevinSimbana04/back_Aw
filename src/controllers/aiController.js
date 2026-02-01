import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs-extra';
import Estudiante from "../models/Estudiante.js";
import Historial from "../models/Historial.js";


const scanFood = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: "No se ha subido ninguna imagen" });
        }

        // Obtener ID del usuario del token
        // Por ahora verificamos si existe en req.body para pruebas o req.estudiante
        // En tu estudianteRoutes usas verificarAutenticacion? 
        // Vamos a asumir que el middleware de auth coloca req.estudianteBDD._id o similar.
        // Si no, lo pediremos en el body para este ejemplo, pero lo ideal es sacar del token.
        // Ajustaremos esto si vemos el middleware Auth.

        let userId = req.estudianteHeader ? req.estudianteHeader._id : req.body.userId;

        let userProfile = {};
        if (userId) {
            const student = await Estudiante.findById(userId);
            if (student) {
                userProfile = {
                    nombre: student.nombre,
                    alergias: student.alergias,
                    preferencias: student.preferencias,
                    objetivo: student.dieta,
                    actividad: student.actividadFisica
                };
            }
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const imageFile = req.files.image;
        const imagePath = imageFile.tempFilePath;

        // Convertir imagen a base64
        const fileData = await fs.readFile(imagePath);
        const imageBase64 = fileData.toString('base64');
        const mimeType = imageFile.mimetype;

        const prompt = `
            Actúa como un nutricionista experto. Analiza esta imagen de comida.
            
            1. Identifica qué comida es.
            2. Estima su contenido nutricional aproximado (calorías, carbohidratos, proteínas, grasas).
            3. Dame una recomendación personalizada para un usuario con este perfil:
               - Nombre: ${userProfile.nombre || "Usuario"}
               - Alergias: ${userProfile.alergias || "Ninguna"}
               - Preferencias: ${userProfile.preferencias || "Ninguna"}
               - Objetivo/Dieta: ${userProfile.objetivo || "General"}
               - Actividad Física: ${userProfile.actividad || "Moderada"}

            Si la imagen no es comida, responde indicando que no se detectó comida.

            Devuelve la respuesta ESTRICTAMENTE en este formato JSON (sin texto adicional fuera del JSON):
            {
                "foodName": "Nombre del plato",
                "nutrients": {
                    "calories": "ej. 500 kcal",
                    "carbs": "ej. 40g",
                    "protein": "ej. 20g",
                    "fat": "ej. 15g"
                },
                "isFood": true,
                "recommendation": "Tu recomendación aquí..."
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Limpieza básica del JSON por si el modelo devuelve markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Limpiar archivo temporal
        await fs.unlink(imagePath);

        // Guardar en historial si existe usuario
        if (userId && data.isFood) {
            try {
                const nuevoHistorial = new Historial({
                    estudiante: userId,
                    nombreComida: data.foodName,
                    calorias: data.nutrients?.calories || "N/A",
                    proteinas: data.nutrients?.protein || "N/A",
                    carbohidratos: data.nutrients?.carbs || "N/A",
                    grasas: data.nutrients?.fat || "N/A",
                    recomendacion: data.recommendation
                });
                await nuevoHistorial.save();
                // Adjuntar ID del historial a la respuesta por si el frontend lo necesita
                data.historialId = nuevoHistorial._id;
            } catch (saveError) {
                console.error("Error guardando historial:", saveError);
                // No fallamos la request principal, solo logueamos
            }
        }

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al procesar la imagen con IA", error: error.message });
    }
};

const getHistorial = async (req, res) => {
    try {
        const userId = req.estudianteHeader._id;
        const { fecha } = req.query;

        let filtro = { estudiante: userId };

        // Si se provee fecha (YYYY-MM-DD), filtramos por ese día
        // Esto ayuda a ver las comidas "del día" (las 3 veces al día que menciona el usuario)
        if (fecha) {
            const start = new Date(fecha);
            start.setHours(0, 0, 0, 0);
            const end = new Date(fecha);
            end.setHours(23, 59, 59, 999);
            filtro.fecha = { $gte: start, $lte: end };
        }

        const historial = await Historial.find(filtro).sort({ fecha: -1 });
        res.json(historial);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener historial", error: error.message });
    }
};



export {
    scanFood,
    getHistorial
};
