import { Request, Response, NextFunction } from 'express';
import { loginUser, loginWithGoogle, getUserById, verifyJwtToken } from '../services/userService';

/**
 * Handles user login requests with credentials
 */
export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;
    const session = await loginUser(username, password);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles Google OAuth 2.0 login requests
 */
export async function googleLoginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, google_id, name, avatar_url } = req.body;
    if (!email || !google_id) {
      res.status(400).json({ error: 'Validation Error: Email and Google ID are required for Google Auth.' });
      return;
    }
    const session = await loginWithGoogle(email, google_id, name, avatar_url);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching current authenticated user via JWT Authorization header or session ID header
 */
export async function getCurrentUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyJwtToken(token);
      const session = await getUserById(decoded.user_id);
      res.json({ ...session, token });
      return;
    }

    const userIdHeader = req.headers['x-user-id'];
    if (!userIdHeader) {
      res.status(401).json({ error: 'Unauthorized: Missing session identity.' });
      return;
    }

    const userId = parseInt(userIdHeader as string, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Validation Error: Invalid session ID.' });
      return;
    }

    const session = await getUserById(userId);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching all users
 */
export async function listUsersHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listUsers } = await import('../services/userService');
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { createUser } = await import('../services/userService');
    const { username, role, password, email } = req.body;
    const user = await createUser(username, role, password, email);
    res.status(201).json({ message: 'User created', userId: user.user_id });
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { updateUser } = await import('../services/userService');
    const { username, role, password, email } = req.body;
    await updateUser(Number(req.params.id), username, role, password, email);
    res.json({ message: 'User updated' });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { deleteUser } = await import('../services/userService');
    await deleteUser(Number(req.params.id));
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}
