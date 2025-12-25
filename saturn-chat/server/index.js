const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');//importar la libreria

const app = express();
app.use(cors()); // conectar con el frontend
app.use(express.json()); // para que el servidor pueda entender el json

const PORT = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send('¡Hola! El servidor Saturno está funcionando 🪐');
});



app.post('/api/chat', async (req, res) => {

    try {
        const {message} = req.body;
        if (!message) {
            return res.status(400).json({error: 'No message provided'});

        }

        //elegir el modelo
        const model = genAI.getGenerativeModel({model: 'gemini-pro'});

        //le envuamos mensaje a la ia y esperamos respuesta
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        //devolvemos respuesta al front
        res.json({ reply: text});

    } catch (error) {
        console.error('Error al generar respuesta:', error);
        res.status(500).json({error: 'Error al generar respuesta'});
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Saturno corriendo en: http://localhost:${PORT}`);
});