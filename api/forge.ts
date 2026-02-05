import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, currentModel, mode } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in Vercel' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-2.0-flash-exp as it's the most capable for this
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        x: { type: SchemaType.NUMBER },
                        y: { type: SchemaType.NUMBER },
                        z: { type: SchemaType.NUMBER },
                        color: { type: SchemaType.STRING },
                    },
                    required: ["x", "y", "z", "color"],
                },
            },
        }
    });

    let context = "";
    if (mode === 'morph' && currentModel) {
        context = `
            CONTEXT: You are modifying or re-assembling an existing voxel model. 
            CURRENT MODEL DATA (Sample): ${JSON.stringify(currentModel.slice(0, 10))}...
            GOAL: Adapt the current shape into: "${prompt}".
            Maintain a similar scale and voxel count (between 150-300).
        `;
    } else {
        context = `CONTEXT: Create a new 3D voxel model for: "${prompt}".`;
    }

    const systemInstruction = `
        Act as a 3D Voxel Architect. 
        Format: JSON array of { x, y, z, color }.
        Rules:
        1. Detail: 150-300 voxels.
        2. Connected structure.
        3. y >= 0.
        4. Colors: Use vibrant hex codes.
    `;

    const result = await model.generateContent([systemInstruction, context]);
    const response = await result.response;
    return res.status(200).json(JSON.parse(response.text()));

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
