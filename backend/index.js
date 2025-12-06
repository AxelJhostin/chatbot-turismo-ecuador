const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- PROMPT AVANZADO PARA ITINERARIOS ---
const SYSTEM_PROMPT = `
Eres un planificador de viajes experto de Ecuador 🇪🇨.
Tu objetivo es generar itinerarios detallados y estructurados.

INSTRUCCIONES DE FORMATO JSON:
Siempre responde con un objeto JSON.
Analiza la intención del usuario:

CASO 1: El usuario pide una recomendación, viaje, itinerario o "qué hacer".
Genera una estructura de CRONOGRAMA:
{
  "type": "itinerary",
  "title": "Título corto del viaje (ej: Aventura en Baños)",
  "region": "Costa / Sierra / Oriente / Galápagos",
  "duration": "3 Días / 1 Fin de semana",
  "budget": "Presupuesto estimado (USD)",
  "schedule": [
    { 
      "day": "Día 1", 
      "time": "Mañana", 
      "activity": "Nombre actividad principal", 
      "description": "Breve detalle atractivo (max 10 palabras)." 
    },
    { 
      "day": "Día 1", 
      "time": "Tarde", 
      "activity": "Nombre actividad", 
      "description": "Breve detalle." 
    },
    { 
      "day": "Día 2", 
      "time": "Mañana", 
      "activity": "Nombre actividad", 
      "description": "Breve detalle." 
    }
  ]
}
(Genera al menos 3 items en el schedule).

CASO 2: El usuario saluda o pregunta algo general.
{
  "type": "text",
  "content": "Respuesta conversacional amable."
}

NO USES MARKDOWN. SOLO JSON PURO.
`;

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: { responseMimeType: "application/json" },
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ],
    });

    const result = await chat.sendMessage({ message });
    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(result.text);
    } catch (e) {
      console.error("Error parseando JSON:", e);
      // Fallback por si la IA falla
      jsonResponse = { 
        type: "text", 
        content: "¡Tengo una gran idea para ti! Pero hubo un pequeño error al procesarla. ¿Me preguntas de nuevo?" 
      };
    }

    res.json(jsonResponse);

  } catch (error) {
    console.error('Error server:', error);
    res.status(500).json({ type: "text", content: "Error de conexión." });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor Itinerario (v3) corriendo en http://localhost:${port}`);
});