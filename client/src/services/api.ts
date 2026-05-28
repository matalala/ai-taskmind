import axios from 'axios';

const API_URL = 'https://ai-taskmind.onrender.com/api/tasks';

export interface Subtask {
  _id?: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  subtasks: Subtask[];
  createdAt: string;
}
// Interceptor de Axios: Inyecta el token JWT en las cabeceras antes de mandar la petición
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const taskAPI = {
  // Obtener todas las tareas
  getAll: async (): Promise<Task[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Crear una nueva tarea (puede disparar la IA)
  create: async (taskData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    useAI: boolean;
  }): Promise<Task> => {
    const response = await axios.post(API_URL, taskData);
    return response.data;
  },

  // Actualizar estado de una tarea o sus subtareas
  update: async (id: string, updatedData: Partial<Task>): Promise<Task> => {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  },

  // Eliminar una tarea
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};