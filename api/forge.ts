import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  maxDuration: 30, // Gemini can be slow
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Get API Key from environment variable (Vercel Dashboard)
  const API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!API_KEY) {
    console.error("CRITICAL: GOOGLE_API_KEY is missing from process.env");
    return res.status(500).json({ 
      error: 'Server configuration error: Missing API Key',
      debug: 'Check Vercel Dashboard > Environment Variables' 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-1.5-flash or gemini-2.0-flash-exp
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
    `.replace(/\s+/g, ' ').trim();

    const result = await model.generateContent([systemInstruction, `Generate a voxel model for: ${prompt}`]);
    const response = await result.response;
    let text = response.text();
    
    // Cleanup AI formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const voxelData = JSON.parse(text);
        return res.status(200).json(voxelData);
    } catch (parseError) {
        console.error("JSON Parse Error:", text);
        return res.status(500).json({ error: "Invalid response from AI" });
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message || "Intelligence failure" });
  }
}
