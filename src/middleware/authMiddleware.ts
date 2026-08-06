import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../services/userService';

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    username: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT token from Authorization header or fallback to header role
 */
export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyJwtToken(token);
      req.user = decoded;
      // Synthesize x-user-role header for existing handlers
      req.headers['x-user-role'] = decoded.role;
      return next();
    } catch {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token.' });
      return;
    }
  }

  // Fallback check for x-user-role header for legacy local requests
  if (req.headers['x-user-role']) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: Authentication required.' });
}

/**
 * Role verification middleware checking req.user or x-user-role header
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as AuthenticatedRequest).user?.role || req.headers['x-user-role'];
    if (!userRole || !allowedRoles.includes(userRole as string)) {
      res.status(403).json({
        error: `Forbidden Error: Access denied. This action requires one of the following permissions: ${allowedRoles.join(', ')}`
      });
      return;
    }
    next();
  };
};
