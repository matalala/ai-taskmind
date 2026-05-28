import axios from 'axios';

const AUTH_URL = 'https://ai-taskmind.onrender.com/api/auth';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${AUTH_URL}/register`, { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${AUTH_URL}/login`, { email, password });
    return response.data;
  }
};