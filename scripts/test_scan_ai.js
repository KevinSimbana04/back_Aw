import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración - Ajusta estos valores
const BASE_URL = 'http://localhost:3000/api';
const EMAIL = 'estudiante@test.com'; // Asegúrate de que este usuario exista y esté confirmado
const PASSWORD = 'password123';
const IMAGE_PATH = './test_image.jpg'; // Ruta a una imagen de comida de prueba

// Helpers para rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
    console.log("=== Iniciando Prueba de Escaneo IA ===");

    // 1. Iniciar sesión
    console.log(`\n1. Iniciando sesión como ${EMAIL}...`);
    try {
        const loginRes = await fetch(`${BASE_URL}/estudiante/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Error en login (${loginRes.status}): ${err}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login exitoso. Token obtenido.");
        console.log("Usuario:", loginData.nombre, loginData.apellido);

        // 2. Escanear imagen
        console.log(`\n2. Subiendo imagen para escaneo... (${IMAGE_PATH})`);

        // Verificar si existe la imagen
        const resolvedImagePath = path.resolve(__dirname, IMAGE_PATH);
        if (!fs.existsSync(resolvedImagePath)) {
            throw new Error(`La imagen de prueba no existe en: ${resolvedImagePath}. Por favor coloca una imagen jpg llamada 'test_image.jpg' en la carpeta del script.`);
        }

        const form = new FormData();
        form.append('image', fs.createReadStream(resolvedImagePath));

        const scanRes = await fetch(`${BASE_URL}/ai/scan`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // FormData headers se manejan automáticamente por la librería
            },
            body: form
        });

        if (!scanRes.ok) {
            const err = await scanRes.text();
            throw new Error(`Error en escaneo (${scanRes.status}): ${err}`);
        }

        const scanData = await scanRes.json();
        console.log("\n=== Resultado del Escaneo ===");
        console.log(JSON.stringify(scanData, null, 2));

        if (scanData.budgetAnalysis) {
            console.log("\n💡 Análisis de Presupuesto:", scanData.budgetAnalysis);
        }

    } catch (error) {
        console.error("\n❌ Error en la prueba:", error.message);
    }
}

runTest();
