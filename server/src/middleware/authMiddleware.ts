import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_de_taskmind';

// Extendemos la interfaz de Express para poder guardar el userId dentro de req
export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Buscar el token en el header 'Authorization'
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: 'No hay token, autorización denegada.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id; // Le inyectamos el ID del usuario a la petición
    next(); // Continuar al controlador
  } catch (error) {
    res.status(401).json({ message: 'Token no válido o expirado.' });
  }
};