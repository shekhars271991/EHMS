import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { prisma } from '../config/db';

export const logAuditEvent = (action: string, resourceType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Intercept finish to log only on successful operations
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const resourceId = req.params.id || req.body?.id || 'unknown';
          await prisma.auditLog.create({
            data: {
              userId: req.user?.userId || null,
              action,
              resourceType,
              resourceId: String(resourceId),
              clientIp: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'] || 'unknown',
              details: {
                method: req.method,
                path: req.originalUrl,
                params: req.params,
              },
            },
          });
        } catch (error) {
          console.error('[AuditLog Error]: Failed to persist audit record', error);
        }
      }
    });

    next();
  };
};
