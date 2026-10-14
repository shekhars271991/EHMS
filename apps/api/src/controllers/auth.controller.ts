import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials or inactive account' });
      }

      if (user.role === 'PATIENT') {
        return res.status(403).json({ error: 'This portal is for doctors and clinic staff only.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const secret = process.env.JWT_SECRET || 'super-secret-ophthalmology-jwt-key-2026';
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
        secret,
        { expiresIn: '8h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          licenseNumber: user.licenseNumber,
        },
      });
    } catch (err: any) {
      // Keep database and infrastructure details in the API logs only.
      console.error('[Auth] Sign-in failed:', err);
      return res.status(503).json({ error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, fullName: true, role: true, licenseNumber: true },
    });
    return res.json({ user });
  }
}
