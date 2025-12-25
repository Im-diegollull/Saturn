import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import chatsRouter from './routes/chats.js';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

console.log('📦 Base de datos SQLite conectada');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Rutas de chats
app.use('/api/chats', chatsRouter);

app.get('/', (req, res) => {
    res.send('¡Hola! El servidor Saturno está funcionando 🪐');
});



app.post('/api/chat', async (req, res) => {
    try {
        const { message, chatId } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // Generar respuesta con Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: message,
        });

        const reply = response.text;

        // Si hay chatId, guardar en SQLite
        if (chatId) {
            try {
                // Guardar mensaje del usuario
                db.prepare('INSERT INTO messages (chat_id, text, sender) VALUES (?, ?, ?)').run(chatId, message, 'user');
                // Guardar respuesta del bot
                db.prepare('INSERT INTO messages (chat_id, text, sender) VALUES (?, ?, ?)').run(chatId, reply, 'bot');
                // Actualizar título del chat si es el primer mensaje
                const chat = db.prepare('SELECT title FROM chats WHERE id = ?').get(chatId);
                if (chat && chat.title === 'Nuevo Chat') {
                    const newTitle = message.substring(0, 30) + (message.length > 30 ? '...' : '');
                    db.prepare('UPDATE chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newTitle, chatId);
                } else {
                    db.prepare('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(chatId);
                }
            } catch (dbError) {
                console.error('Error guardando en DB:', dbError);
            }
        }

        res.json({ reply });

    } catch (error) {
        console.error('Error al generar respuesta:', error);
        res.status(500).json({ error: 'Error al generar respuesta' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Saturno corriendo en: http://localhost:${PORT}`);
});