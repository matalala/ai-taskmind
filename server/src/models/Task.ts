import { Schema, model, Document,Types } from 'mongoose';

// Definimos la interfaz para TypeScript
export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  subtasks: {
    title: string;
    isCompleted: boolean;
  }[];
  createdAt: Date;
  user: Types.ObjectId;
}

// Creamos el Schema de Mongoose
const TaskSchema = new Schema<ITask>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { 
    type: String, 
    required: [true, 'El título es obligatorio'], 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['backlog', 'todo', 'in_progress', 'done'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  subtasks: [
    {
      title: { type: String, required: true },
      isCompleted: { type: Boolean, default: false }
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
});

export default model<ITask>('Task', TaskSchema);