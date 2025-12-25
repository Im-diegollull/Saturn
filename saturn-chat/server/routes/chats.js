import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/chats - Listar todos los chats
router.get('/', (req, res) => {
  try {
    const chats = db.prepare('SELECT id as _id, title, updated_at as updatedAt FROM chats ORDER BY updated_at DESC').all();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener chats' });
  }
});

// GET /api/chats/:id - Obtener un chat específico con sus mensajes
router.get('/:id', (req, res) => {
  try {
    const chat = db.prepare('SELECT id as _id, title, created_at, updated_at FROM chats WHERE id = ?').get(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
    
    const messages = db.prepare('SELECT text, sender, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json({ ...chat, messages });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener chat' });
  }
});

// POST /api/chats - Crear nuevo chat
router.post('/', (req, res) => {
  try {
    const result = db.prepare('INSERT INTO chats (title) VALUES (?)').run('Nuevo Chat');
    const chat = db.prepare('SELECT id as _id, title, updated_at as updatedAt FROM chats WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear chat' });
  }
});

// DELETE /api/chats/:id - Eliminar chat
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM messages WHERE chat_id = ?').run(req.params.id);
    const result = db.prepare('DELETE FROM chats WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Chat no encontrado' });
    res.json({ message: 'Chat eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar chat' });
  }
});

export default router;
