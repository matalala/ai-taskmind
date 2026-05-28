import { Request, Response } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_de_taskmind';

export const authController = {
  // REGISTRO
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Verificar si ya existe el mail
      const userExists = await User.findOne({ email });
      if (userExists) {
        res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        return;
      }

      // Hashear la contraseña (seguridad)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      // Generar Token JWT automático al registrarse
      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor al registrar usuario.' });
    }
  },

  // LOGIN
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Credenciales inválidas.' });
        return;
      }

      // Validar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Credenciales inválidas.' });
        return;
      }

      // Generar Token JWT firmado
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
    }
  }
};