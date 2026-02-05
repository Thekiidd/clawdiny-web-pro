import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/forge', async (req, res) => {
    const { prompt } = req.body;
    console.log(`> Recibiendo petición de forja para: "${prompt}"`);
    
    try {
        const systemInstruction = `
            Act as a 3D Voxel Architect. Generate a character model based on the user prompt.
            Output format: A plain JSON array of voxel objects.
            Voxel Object: { "x": int, "y": int, "z": int, "color": "hex_string" }
            
            Rules:
            1. Use 150 to 300 voxels.
            2. Return ONLY the JSON array. NO text, NO markdown.
        `.replace(/\n/g, ' ');

        // Ejecutamos openclaw agent para usar tu inteligencia directamente
        const command = `openclaw agent --message "${systemInstruction} Create a voxel model for: ${prompt}" --json`;
        
        const { stdout } = await execPromise(command);
        const result = JSON.parse(stdout);
        
        // El resultado de openclaw agent --json suele tener la respuesta en result.text o similar
        let text = result.result.text;
        
        // Limpieza de markdown si existe
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const voxelData = JSON.parse(text);
        console.log(`> Forja exitosa via OpenClaw: ${voxelData.length} voxels.`);
        res.json(voxelData);
    } catch (error) {
        console.error("Error en la forja:", error);
        res.status(500).json({ error: "Intelligence bridge failure" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Voxel Forge Agent Bridge running on http://localhost:${PORT}`);
});
