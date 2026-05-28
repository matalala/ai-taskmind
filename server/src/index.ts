import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import aiRouter from './routes/aiRoutes.js';
import taskRouter from './routes/taskRoutes.js'; // <-- 1. Importamos las rutas de tareas
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_taskmind';

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Conexión a MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('💾 Conectado exitosamente a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/ai', aiRouter);
app.use('/api/tasks', taskRouter); // <-- 2. Conectamos el endpoint /api/tasks

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor corriendo perfectamente' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor AI-TaskMind escuchando en el puerto ${PORT}`);
});