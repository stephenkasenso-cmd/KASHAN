import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './familyService';

export const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_family_tree_secret_key_2026';

export interface UserSession {
  user_id: number;
  username: string;
  email?: string | null;
  role: 'Admin' | 'Manager' | 'Staff';
  avatar_url?: string | null;
  token?: string;
}

/**
 * Input sanitization to protect against XSS and injection
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, ''); // strip potential script/html tags
}

/**
 * Hashes a plain password using bcryptjs
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return { hash, salt };
}

/**
 * Verifies a password against stored bcrypt hash or legacy PBKDF2 hash
 */
export function verifyPassword(password: string, storedHash: string | null, salt: string | null): boolean {
  if (!storedHash) return false;

  // 1. Try bcrypt match
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compareSync(password, storedHash);
  }

  // 2. Legacy PBKDF2 fallback
  if (salt) {
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return storedHash === checkHash;
  }

  return false;
}

/**
 * Generates JWT token for user session
 */
export function signJwtToken(user: { user_id: number; username: string; role: string }): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verifies JWT token
 */
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Unauthorized: Invalid or expired token.');
  }
}

/**
 * Seeds default Admin, Manager, and Staff users if missing
 */
export async function seedDefaultUsers(): Promise<void> {
  const defaultUsers = [
    { username: 'admin1', password: 'admin1pass', role: 'Admin', email: 'admin1@familytree.org' },
    { username: 'admin2', password: 'admin2pass', role: 'Admin', email: 'admin2@familytree.org' },
    { username: 'manager1', password: 'manager1pass', role: 'Manager', email: 'manager1@familytree.org' },
    { username: 'manager2', password: 'manager2pass', role: 'Manager', email: 'manager2@familytree.org' },
    { username: 'staff1', password: 'staff1pass', role: 'Staff', email: 'staff1@familytree.org' },
    { username: 'staff2', password: 'staff2pass', role: 'Staff', email: 'staff2@familytree.org' },
  ];

  for (const user of defaultUsers) {
    const existing = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (!existing) {
      const { hash, salt } = hashPassword(user.password);
      await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password_hash: hash,
          salt: salt,
          role: user.role,
        },
      });
      console.log(`Seeded user: ${user.username} (${user.role})`);
    }
  }
}

/**
 * Validates login credentials with specific error messaging
 */
export async function loginUser(rawUsername: string, rawPassword?: string): Promise<UserSession> {
  const username = sanitizeInput(rawUsername);
  const password = rawPassword ? rawPassword.trim() : '';

  if (!username || !password) {
    throw new Error('Validation Error: Both username and password are required.');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    },
  });

  if (!user) {
    throw new Error('Account not found: No user account exists with that username or email.');
  }

  if (!user.password_hash || !verifyPassword(password, user.password_hash, user.salt)) {
    throw new Error('Invalid credentials: The password you entered is incorrect.');
  }

  const token = signJwtToken({
    user_id: user.user_id,
    username: user.username,
    role: user.role,
  });

  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role as 'Admin' | 'Manager' | 'Staff',
    avatar_url: user.avatar_url,
    token,
  };
}

/**
 * Google OAuth 2.0 Integration: Authenticate or Auto-provision Google User
 */
export async function loginWithGoogle(
  email: string,
  googleId: string,
  name?: string,
  avatarUrl?: string
): Promise<UserSession> {
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanGoogleId = sanitizeInput(googleId);

  if (!cleanEmail || !cleanGoogleId) {
    throw new Error('Validation Error: Invalid Google OAuth payload.');
  }

  // 1. Check if user exists by google_id or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { google_id: cleanGoogleId },
        { email: cleanEmail }
      ]
    }
  });

  if (!user) {
    // Register new Google user with Staff role default
    const baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '_') : cleanEmail.split('@')[0];
    let uniqueUsername = baseUsername;
    let count = 1;
    while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
      uniqueUsername = `${baseUsername}_${count++}`;
    }

    user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        email: cleanEmail,
        google_id: cleanGoogleId,
        avatar_url: avatarUrl || null,
        role: 'Staff',
      }
    });
  } else if (!user.google_id) {
    // Link existing email user with google_id
    user = await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        google_id: cleanGoogleId,
        avatar_url: avatarUrl || user.avatar_url
      }
    });
  }

  const token = signJwtToken({
    user_id: user.user_id,
    username: user.username,
    role: user.role,
  });

  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role as 'Admin' | 'Manager' | 'Staff',
    avatar_url: user.avatar_url,
    token,
  };
}

/**
 * Fetches user session by ID
 */
export async function getUserById(userId: number): Promise<UserSession> {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
  });

  if (!user) {
    throw new Error('Account not found: User does not exist.');
  }

  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role as 'Admin' | 'Manager' | 'Staff',
    avatar_url: user.avatar_url,
  };
}

/**
 * List all users
 */
export async function listUsers(): Promise<UserSession[]> {
  const users = await prisma.user.findMany({
    orderBy: { username: 'asc' }
  });
  return users.map(user => ({
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role as 'Admin' | 'Manager' | 'Staff',
    avatar_url: user.avatar_url,
  }));
}

/**
 * User CRUD Operations
 */
export async function createUser(username: string, role: string, password?: string, email?: string) {
  const cleanUsername = sanitizeInput(username);
  const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
  if (existing) throw new Error(`Username ${cleanUsername} is already taken.`);

  const pwd = password || 'defaultpass123';
  const { hash, salt } = hashPassword(pwd);

  return await prisma.user.create({
    data: {
      username: cleanUsername,
      email: email ? sanitizeInput(email) : null,
      role,
      password_hash: hash,
      salt
    }
  });
}

export async function updateUser(id: number, username: string, role: string, password?: string, email?: string) {
  const cleanUsername = sanitizeInput(username);
  const data: any = { username: cleanUsername, role };
  if (email) data.email = sanitizeInput(email);

  if (password && password.trim()) {
    const { hash, salt } = hashPassword(password);
    data.password_hash = hash;
    data.salt = salt;
  }
  return await prisma.user.update({ where: { user_id: id }, data });
}

export async function deleteUser(id: number) {
  const userToDelete = await prisma.user.findUnique({ where: { user_id: id } });
  if (userToDelete?.role === 'Admin') {
    const adminCount = await prisma.user.count({ where: { role: 'Admin' } });
    if (adminCount <= 1) throw new Error('Cannot delete the last remaining Admin user.');
  }
  return await prisma.user.delete({ where: { user_id: id } });
}
