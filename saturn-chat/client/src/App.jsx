import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001';

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)

  // Cargar lista de chats al iniciar
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chats`);
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Error cargando chats:', error);
    }
  };

  // Crear nuevo chat
  const createNewChat = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chats`, { method: 'POST' });
      const newChat = await res.json();
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat._id);
      setMessages([]);
    } catch (error) {
      console.error('Error creando chat:', error);
    }
  };

  // Cargar un chat específico
  const loadChat = async (chatId) => {
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`);
      const chat = await res.json();
      setCurrentChatId(chat._id);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error('Error cargando chat:', error);
    }
  };

  // Eliminar chat
  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/chats/${chatId}`, { method: 'DELETE' });
      setChats(chats.filter(c => c._id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error eliminando chat:', error);
    }
  };

  const sendMessage = async (textToSend = input) => {
    if (!textToSend.trim()) return; 

    // Si no hay chat activo, crear uno nuevo
    let chatId = currentChatId;
    if (!chatId) {
      try {
        const res = await fetch(`${API_URL}/api/chats`, { method: 'POST' });
        const newChat = await res.json();
        chatId = newChat._id;
        setCurrentChatId(chatId);
        setChats([newChat, ...chats]);
      } catch (error) {
        console.error('Error creando chat:', error);
      }
    }

    const newMessages = [...messages, { text: textToSend, sender: "user" }];
    setMessages(newMessages);
    setInput(''); 
    setIsLoading(true); 

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, chatId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages([...newMessages, { text: data.reply, sender: "bot" }]);
      
      // Refrescar lista de chats para actualizar títulos
      fetchChats();

    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { text: "Error al conectar con Saturno 🌑. Verifica que el servidor esté corriendo.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  }

  return (
    <div className="flex h-screen bg-saturn-dark text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-0'
      } bg-saturn-light flex flex-col border-r border-gray-700 transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="p-4 border-b border-gray-700 flex items-center gap-2 min-w-max">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-saturn-gold to-orange-500 animate-pulse"></div>
          <h1 className="text-xl font-bold tracking-wider">SaturnAI</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-w-max">
          <button 
            onClick={() => { setCurrentChatId(null); setMessages([]); }} 
            className="w-full text-left p-3 rounded-lg hover:bg-white/5 text-gray-300 text-sm transition-colors border border-dashed border-gray-600 hover:border-saturn-gold mb-2 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Chat
          </button>
          
          {/* Lista de chats guardados */}
          <div className="space-y-1">
            {chats.map(chat => (
              <div 
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all text-sm ${
                  currentChatId === chat._id 
                    ? 'bg-saturn-gold/20 border border-saturn-gold/50 text-white' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate flex-1">{chat.title || 'Nuevo Chat'}</span>
                <button
                  onClick={(e) => deleteChat(chat._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-saturn-dark/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-gray-400 text-sm hidden sm:block">Modelo: <span className="text-saturn-gold font-bold">Gemini Pro</span></span>
          </div>
        </header>

        {/* Zona de Mensajes */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
            {/* Pantalla de Bienvenida */}
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in p-8">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-saturn-gold via-orange-400 to-saturn-purple animate-pulse-slow shadow-2xl shadow-saturn-gold/20 blur-xl absolute inset-0"></div>
                  <div className="relative w-32 h-32 rounded-full bg-saturn-light border-2 border-saturn-gold flex items-center justify-center text-6xl shadow-xl z-10">
                    🪐
                  </div>
                </div>
                <div className="text-center space-y-4 max-w-2xl px-4">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-saturn-gold via-orange-400 to-saturn-purple bg-clip-text text-transparent pb-2">
                    ¡Hola! Soy Saturno
                  </h1>
                  <p className="text-xl text-gray-400">
                    Tu asistente espacial. Pregúntame lo que quieras.
                  </p>
                  
                  {/* Botones de sugerencia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-lg mx-auto">
                    {[
                      { icon: '💡', text: 'Ideas para un blog' },
                      { icon: '✨', text: 'Cuéntame un dato curioso' },
                      { icon: '💻', text: 'Explica React useEffect' },
                      { icon: '🚀', text: 'Plan de viaje a Japón' }
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(item.text)} // Al hacer click envía el mensaje directo
                        className="p-4 bg-saturn-light/50 hover:bg-saturn-light rounded-xl border border-gray-700 hover:border-saturn-gold transition-all text-left group"
                      >
                        <span className="text-2xl mb-2 block">{item.icon}</span>
                        <span className="text-sm text-gray-300 group-hover:text-white font-medium">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Lista de Mensajes */}
            {messages.map((msg, index) => (
                <div key={index} className={`py-6 ${msg.sender === 'bot' ? 'bg-saturn-light/30' : ''} animate-slide-up border-b border-white/5`}>
                    <div className="max-w-3xl mx-auto px-6">
                        <div className={`flex gap-6 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${
                                msg.sender === 'user' 
                                    ? 'bg-gradient-to-br from-saturn-purple to-indigo-600' 
                                    : 'bg-gradient-to-br from-saturn-gold to-orange-500'
                            }`}>
                                {msg.sender === 'user' ? '👤' : '🪐'}
                            </div>
                            <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                <p className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">{msg.sender === 'user' ? 'Tú' : 'Saturno'}</p>
                                <div className="text-gray-100 leading-7 whitespace-pre-wrap font-light text-base/7">
                                  {msg.text}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Loader */}
            {isLoading && (
              <div className="py-6 bg-saturn-light/30 animate-pulse">
                  <div className="max-w-3xl mx-auto px-6 flex gap-6">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saturn-gold to-orange-500 flex items-center justify-center flex-shrink-0">🪐</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 bg-saturn-gold rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-saturn-gold rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-saturn-gold rounded-full animate-bounce delay-150"></span>
                      </div>
                  </div>
              </div>
            )}
            <div className="h-4" /> {/* Espaciado final */}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-saturn-dark border-t border-gray-700/50">
          <div className="max-w-3xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Envía un mensaje a Saturno..." 
              className="w-full bg-saturn-light text-white p-4 pr-12 rounded-xl border border-gray-600 focus:border-saturn-gold focus:outline-none focus:ring-1 focus:ring-saturn-gold transition-all shadow-2xl placeholder-gray-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button 
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-3 p-2 text-saturn-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3 font-mono">SaturnAI puede cometer errores. Verifica la información.</p>
        </div>
      </main>
    </div>
  )
}

export default App