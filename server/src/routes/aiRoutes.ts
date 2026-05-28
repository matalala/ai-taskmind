import { Router, Request, Response } from 'express';
import { generateSubtasksFromIA } from '../services/aiService';

const router = Router();

router.post('/suggest-subtasks', async (req: Request, res: Response): Promise<void> => {
  const { title, description } = req.body;

  if (!title) {
    res.status(400).json({ error: 'El título de la tarea es obligatorio.' });
    return;
  }

 try {
    // Todo junto y con la S mayúscula:
    const subtareasSugeridas = await generateSubtasksFromIA(title, description || '');
    res.json({ subtasks: subtareasSugeridas });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un problema al procesar la solicitud con el Agente de IA.' });
  }
});

export default router;