"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
exports.authenticateJwt = authenticateJwt;
const userService_1 = require("../services/userService");
/**
 * Middleware to authenticate JWT token from Authorization header or fallback to header role
 */
function authenticateJwt(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = (0, userService_1.verifyJwtToken)(token);
            req.user = decoded;
            // Synthesize x-user-role header for existing handlers
            req.headers['x-user-role'] = decoded.role;
            return next();
        }
        catch {
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
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role || req.headers['x-user-role'];
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({
                error: `Forbidden Error: Access denied. This action requires one of the following permissions: ${allowedRoles.join(', ')}`
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=authMiddleware.js.map