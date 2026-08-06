"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.sanitizeInput = sanitizeInput;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signJwtToken = signJwtToken;
exports.verifyJwtToken = verifyJwtToken;
exports.seedDefaultUsers = seedDefaultUsers;
exports.loginUser = loginUser;
exports.loginWithGoogle = loginWithGoogle;
exports.getUserById = getUserById;
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const familyService_1 = require("./familyService");
exports.JWT_SECRET = process.env.JWT_SECRET || 'antigravity_family_tree_secret_key_2026';
/**
 * Input sanitization to protect against XSS and injection
 */
function sanitizeInput(input) {
    if (typeof input !== 'string')
        return '';
    return input
        .trim()
        .replace(/[<>]/g, ''); // strip potential script/html tags
}
/**
 * Hashes a plain password using bcryptjs
 */
function hashPassword(password) {
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hash = bcryptjs_1.default.hashSync(password, salt);
    return { hash, salt };
}
/**
 * Verifies a password against stored bcrypt hash or legacy PBKDF2 hash
 */
function verifyPassword(password, storedHash, salt) {
    if (!storedHash)
        return false;
    // 1. Try bcrypt match
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
        return bcryptjs_1.default.compareSync(password, storedHash);
    }
    // 2. Legacy PBKDF2 fallback
    if (salt) {
        const checkHash = crypto_1.default.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return storedHash === checkHash;
    }
    return false;
}
/**
 * Generates JWT token for user session
 */
function signJwtToken(user) {
    return jsonwebtoken_1.default.sign({
        user_id: user.user_id,
        username: user.username,
        role: user.role,
    }, exports.JWT_SECRET, { expiresIn: '24h' });
}
/**
 * Verifies JWT token
 */
function verifyJwtToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
    }
    catch {
        throw new Error('Unauthorized: Invalid or expired token.');
    }
}
/**
 * Seeds default Admin, Manager, and Staff users if missing
 */
async function seedDefaultUsers() {
    const defaultUsers = [
        { username: 'admin1', password: 'admin1pass', role: 'Admin', email: 'admin1@familytree.org' },
        { username: 'admin2', password: 'admin2pass', role: 'Admin', email: 'admin2@familytree.org' },
        { username: 'manager1', password: 'manager1pass', role: 'Manager', email: 'manager1@familytree.org' },
        { username: 'manager2', password: 'manager2pass', role: 'Manager', email: 'manager2@familytree.org' },
        { username: 'staff1', password: 'staff1pass', role: 'Staff', email: 'staff1@familytree.org' },
        { username: 'staff2', password: 'staff2pass', role: 'Staff', email: 'staff2@familytree.org' },
    ];
    for (const user of defaultUsers) {
        const existing = await familyService_1.prisma.user.findUnique({
            where: { username: user.username },
        });
        if (!existing) {
            const { hash, salt } = hashPassword(user.password);
            await familyService_1.prisma.user.create({
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
async function loginUser(rawUsername, rawPassword) {
    const username = sanitizeInput(rawUsername);
    const password = rawPassword ? rawPassword.trim() : '';
    if (!username || !password) {
        throw new Error('Validation Error: Both username and password are required.');
    }
    const user = await familyService_1.prisma.user.findFirst({
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
        role: user.role,
        avatar_url: user.avatar_url,
        token,
    };
}
/**
 * Google OAuth 2.0 Integration: Authenticate or Auto-provision Google User
 */
async function loginWithGoogle(email, googleId, name, avatarUrl) {
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanGoogleId = sanitizeInput(googleId);
    if (!cleanEmail || !cleanGoogleId) {
        throw new Error('Validation Error: Invalid Google OAuth payload.');
    }
    // 1. Check if user exists by google_id or email
    let user = await familyService_1.prisma.user.findFirst({
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
        while (await familyService_1.prisma.user.findUnique({ where: { username: uniqueUsername } })) {
            uniqueUsername = `${baseUsername}_${count++}`;
        }
        user = await familyService_1.prisma.user.create({
            data: {
                username: uniqueUsername,
                email: cleanEmail,
                google_id: cleanGoogleId,
                avatar_url: avatarUrl || null,
                role: 'Staff',
            }
        });
    }
    else if (!user.google_id) {
        // Link existing email user with google_id
        user = await familyService_1.prisma.user.update({
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
        role: user.role,
        avatar_url: user.avatar_url,
        token,
    };
}
/**
 * Fetches user session by ID
 */
async function getUserById(userId) {
    const user = await familyService_1.prisma.user.findUnique({
        where: { user_id: userId },
    });
    if (!user) {
        throw new Error('Account not found: User does not exist.');
    }
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
    };
}
/**
 * List all users
 */
async function listUsers() {
    const users = await familyService_1.prisma.user.findMany({
        orderBy: { username: 'asc' }
    });
    return users.map(user => ({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
    }));
}
/**
 * User CRUD Operations
 */
async function createUser(username, role, password, email) {
    const cleanUsername = sanitizeInput(username);
    const existing = await familyService_1.prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existing)
        throw new Error(`Username ${cleanUsername} is already taken.`);
    const pwd = password || 'defaultpass123';
    const { hash, salt } = hashPassword(pwd);
    return await familyService_1.prisma.user.create({
        data: {
            username: cleanUsername,
            email: email ? sanitizeInput(email) : null,
            role,
            password_hash: hash,
            salt
        }
    });
}
async function updateUser(id, username, role, password, email) {
    const cleanUsername = sanitizeInput(username);
    const data = { username: cleanUsername, role };
    if (email)
        data.email = sanitizeInput(email);
    if (password && password.trim()) {
        const { hash, salt } = hashPassword(password);
        data.password_hash = hash;
        data.salt = salt;
    }
    return await familyService_1.prisma.user.update({ where: { user_id: id }, data });
}
async function deleteUser(id) {
    const userToDelete = await familyService_1.prisma.user.findUnique({ where: { user_id: id } });
    if (userToDelete?.role === 'Admin') {
        const adminCount = await familyService_1.prisma.user.count({ where: { role: 'Admin' } });
        if (adminCount <= 1)
            throw new Error('Cannot delete the last remaining Admin user.');
    }
    return await familyService_1.prisma.user.delete({ where: { user_id: id } });
}
//# sourceMappingURL=userService.js.map