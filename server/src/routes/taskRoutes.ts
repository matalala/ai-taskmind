import { Router, Request, Response } from 'express';
import Task from '../models/Task.js';
import { generateSubtasksFromIA } from '../services/aiService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// 1. OBTENER TODAS LAS TAREAS
router.get('/', authMiddleware , async (req: Request, res: Response) => {
  try {
const tasks = await Task.find({ user: (req as any).userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas.' });
  }
});

// 2. CREAR UNA NUEVA TAREA (CON OPCIÓN DE IA AGENTE)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { title, description, status, priority, useAI } = req.body;

  if (!title) {
    res.status(400).json({ error: 'El título de la tarea es obligatorio.' });
    return;
  }

  try {
    let finalSubtasks: { title: string; isCompleted: boolean }[] = [];

    // Si el usuario activa el switch de IA, generamos las subtareas antes de guardar
    if (useAI) {
      console.log(`🤖 Agente IA activado para desglosar: "${title}"`);
      const aiSuggested = await generateSubtasksFromIA(title, description || '');
      finalSubtasks = aiSuggested.map(subtask => ({
        title: subtask,
        isCompleted: false
      }));
    }

    const newTask = new Task({
  title,
  description,
  status: status || 'todo',
  priority: priority || 'medium',
  subtasks: finalSubtasks,
  user: (req as any).userId // <-- AGREGÁ ESTA LÍNEA
});

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea.' });
  }
});

// 3. ACTUALIZAR UNA TAREA (Para mover de columna o tildar subtareas)
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTask) {
      res.status(404).json({ error: 'Tarea no encontrada.' });
      return;
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea.' });
  }
});

// 4. ELIMINAR UNA TAREA
router.delete('/:id',authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      res.status(404).json({ error: 'Tarea no encontrada.' });
      return;
    }
    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea.' });
  }
});

export default router;