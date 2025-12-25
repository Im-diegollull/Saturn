#  Saturn AI

Un chat de inteligencia artificial con diseño inspirado en Saturno, construido con Express.js, React y la API de Gemini 2.0/Claude/OpenIA.

##  Iniciar

### 1. Clonar el repositorio
```bash
git clone https://github.com/Im-diegollull/Saturn.git
cd Saturn
```

### 2. Configurar el Backend
```bash
cd saturn-chat/server
npm install
```

Crear archivo `.env`:
```
GEMINI_API_KEY=tu_api_key_de_google
PORT=3001
```

> Obtén tu API key en: https://aistudio.google.com/app/apikey

### 3. Configurar el Frontend
```bash
cd saturn-chat/client
npm install
```

### 4. Ejecutar

**Terminal 1 - Backend:**
```bash
cd saturn-chat/server
npx nodemon index.js
```

**Terminal 2 - Frontend:**
```bash
cd saturn-chat/client
npm run dev
```

### 5. Abrir en el navegador
```
http://localhost:5173
```

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express.js + Gemini 2.0 Flash
- **Base de datos:** SQLite

