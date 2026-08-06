"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.googleLoginHandler = googleLoginHandler;
exports.getCurrentUserHandler = getCurrentUserHandler;
exports.listUsersHandler = listUsersHandler;
exports.createUserHandler = createUserHandler;
exports.updateUserHandler = updateUserHandler;
exports.deleteUserHandler = deleteUserHandler;
const userService_1 = require("../services/userService");
/**
 * Handles user login requests with credentials
 */
async function loginHandler(req, res, next) {
    try {
        const { username, password } = req.body;
        const session = await (0, userService_1.loginUser)(username, password);
        res.json(session);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handles Google OAuth 2.0 login requests
 */
async function googleLoginHandler(req, res, next) {
    try {
        const { email, google_id, name, avatar_url } = req.body;
        if (!email || !google_id) {
            res.status(400).json({ error: 'Validation Error: Email and Google ID are required for Google Auth.' });
            return;
        }
        const session = await (0, userService_1.loginWithGoogle)(email, google_id, name, avatar_url);
        res.json(session);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handles fetching current authenticated user via JWT Authorization header or session ID header
 */
async function getCurrentUserHandler(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = (0, userService_1.verifyJwtToken)(token);
            const session = await (0, userService_1.getUserById)(decoded.user_id);
            res.json({ ...session, token });
            return;
        }
        const userIdHeader = req.headers['x-user-id'];
        if (!userIdHeader) {
            res.status(401).json({ error: 'Unauthorized: Missing session identity.' });
            return;
        }
        const userId = parseInt(userIdHeader, 10);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Validation Error: Invalid session ID.' });
            return;
        }
        const session = await (0, userService_1.getUserById)(userId);
        res.json(session);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handles fetching all users
 */
async function listUsersHandler(req, res, next) {
    try {
        const { listUsers } = await Promise.resolve().then(() => __importStar(require('../services/userService')));
        const users = await listUsers();
        res.json(users);
    }
    catch (error) {
        next(error);
    }
}
async function createUserHandler(req, res, next) {
    try {
        const { createUser } = await Promise.resolve().then(() => __importStar(require('../services/userService')));
        const { username, role, password, email } = req.body;
        const user = await createUser(username, role, password, email);
        res.status(201).json({ message: 'User created', userId: user.user_id });
    }
    catch (error) {
        next(error);
    }
}
async function updateUserHandler(req, res, next) {
    try {
        const { updateUser } = await Promise.resolve().then(() => __importStar(require('../services/userService')));
        const { username, role, password, email } = req.body;
        await updateUser(Number(req.params.id), username, role, password, email);
        res.json({ message: 'User updated' });
    }
    catch (error) {
        next(error);
    }
}
async function deleteUserHandler(req, res, next) {
    try {
        const { deleteUser } = await Promise.resolve().then(() => __importStar(require('../services/userService')));
        await deleteUser(Number(req.params.id));
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=userController.js.map