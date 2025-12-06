const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Importamos la NUEVA librería oficial
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Configuración del cliente con la nueva librería
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Prompt del Sistema (Tu experto en turismo)
const SYSTEM_PROMPT = `
Eres un guía turístico experto, amable y apasionado de Ecuador 🇪🇨.
Tu objetivo es ayudar a los usuarios a planificar sus vacaciones.
- Recomienda lugares basándote en: Costa, Sierra, Amazonía o Galápagos.
- Sugiere platos típicos y mejores fechas.
- Si preguntan precios, dalos en dólares (USD).
- Responde de forma concisa y útil.
`;

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // --- CÓDIGO NUEVO BASADO EN LA DOCUMENTACIÓN QUE ENCONTRASTE ---
    
    // 1. Creamos el chat con el historial inicial (System Prompt)
    const chat = ai.chats.create({
      model: "gemini-2.5-flash", // Usamos el modelo nuevo y rápido
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "¡Entendido! Soy tu guía experto en Ecuador. ¿En qué región estás interesado hoy?" }],
        },
      ],
    });

    // 2. Enviamos el mensaje del usuario
    const result = await chat.sendMessage({
      message: message,
    });

    // 3. Obtenemos la respuesta (nota que ahora es result.text directo)
    console.log("Respuesta de Gemini:", result.text); 

    // Enviamos al frontend
    res.json({ reply: result.text });

  } catch (error) {
    console.error('Error con la nueva librería:', error);
    // Si falla, mostramos el mensaje de error para depurar
    res.status(500).json({ reply: "Lo siento, hubo un error técnico. Intenta de nuevo." });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor Backend (v2) corriendo en http://localhost:${port}`);
});