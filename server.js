import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

// Usando tu API Key de OpenClaw (Gemini)
const API_KEY = "TU_API_KEY_AQUI"; 
const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/api/forge', async (req, res) => {
    const { prompt } = req.body;
    console.log(`> Recibiendo petición de forja: "${prompt}"`);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const systemInstruction = `
            Act as a 3D Voxel Architect. Generate a character model based on the user prompt.
            Format: A plain JSON array of voxel objects.
            Voxel Object: { "x": int, "y": int, "z": int, "color": "hex_string" }
            
            Strict Rules:
            1. Use 150 to 300 voxels for high detail.
            2. The model MUST be a connected character/object.
            3. Coordinates must be integers.
            4. Y must be >= 0.
            5. Return ONLY the JSON array. NO text, NO markdown code blocks.
        `;

        const result = await model.generateContent([systemInstruction, `Create a voxel model for: ${prompt}`]);
        const response = await result.response;
        let text = response.text();
        
        // Limpieza profunda de la respuesta
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const voxelData = JSON.parse(text);
        console.log(`> Forja exitosa: ${voxelData.length} voxels generados.`);
        res.json(voxelData);
    } catch (error) {
        console.error("Error en Gemini:", error);
        res.status(500).json({ error: "Intelligence failure" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Voxel Forge Intelligence running on http://localhost:${PORT}`);
});
