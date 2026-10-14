import { Response, NextFunction } from 'express';
import { UserRole } from '@ehms/shared';
import { AuthenticatedRequest } from './auth.middleware';

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Access requires one of these roles: ${allowedRoles.join(', ')}`,
    });
  };
};
