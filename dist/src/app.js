"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const peopleController_1 = require("./controllers/peopleController");
const relationshipController_1 = require("./controllers/relationshipController");
const reportController_1 = require("./controllers/reportController");
const userController_1 = require("./controllers/userController");
const royalController_1 = require("./controllers/royalController");
const traditionalStoolController_1 = require("./controllers/traditionalStoolController");
const lookupController_1 = require("./controllers/lookupController");
const marriageController_1 = require("./controllers/marriageController");
const userService_1 = require("./services/userService");
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
// Parse incoming JSON requests
app.use(express_1.default.json({ limit: '10mb' }));
// Auto-seed default users
(0, userService_1.seedDefaultUsers)().catch(err => {
    console.error("Failed to seed default users:", err);
});
// Auth API Routes
app.post('/api/auth/login', userController_1.loginHandler);
app.post('/api/auth/google', userController_1.googleLoginHandler);
app.get('/api/auth/me', userController_1.getCurrentUserHandler);
// User Management Routes
app.get('/api/users', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), userController_1.listUsersHandler);
app.post('/api/users', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), userController_1.createUserHandler);
app.put('/api/users/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), userController_1.updateUserHandler);
app.delete('/api/users/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), userController_1.deleteUserHandler);
// API Routes (Individual Registrations & Family Trees)
app.get('/api/people', peopleController_1.listPeopleHandler);
app.post('/api/people', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), peopleController_1.createPersonHandler);
app.put('/api/people/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), peopleController_1.updatePersonHandler);
app.delete('/api/people/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), peopleController_1.deletePersonHandler);
app.get('/api/people/:id/family', peopleController_1.getImmediateFamilyHandler);
app.get('/api/people/:id/ancestors', peopleController_1.getAncestorsHandler);
app.get('/api/people/:id/descendants', peopleController_1.getDescendantsHandler);
app.post('/api/relationships', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), relationshipController_1.createRelationshipHandler);
app.put('/api/relationships/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), relationshipController_1.updateRelationshipHandler);
app.delete('/api/relationships/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), relationshipController_1.deleteRelationshipHandler);
app.get('/api/people/:id/relationships', relationshipController_1.listRelationshipsForPersonHandler);
// Marriage Routes
app.post('/api/marriages', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), marriageController_1.createMarriageHandler);
app.get('/api/marriages/person/:id', marriageController_1.listMarriagesForPersonHandler);
app.delete('/api/marriages/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), marriageController_1.deleteMarriageHandler);
// Royal Routes
app.get('/api/royal/clans', royalController_1.listClansHandler);
app.get('/api/royal/regions', royalController_1.listRegionsHandler);
app.post('/api/royal/regions', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.createRegionHandler);
app.put('/api/royal/regions/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.updateRegionHandler);
app.delete('/api/royal/regions/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.deleteRegionHandler);
app.get('/api/royal/paramountcies', royalController_1.listParamountciesHandler);
app.post('/api/royal/paramountcies', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.createParamountcyHandler);
app.put('/api/royal/paramountcies/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.updateParamountcyHandler);
app.delete('/api/royal/paramountcies/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.deleteParamountcyHandler);
app.get('/api/royal/sub-stools', royalController_1.listSubStoolsHandler);
app.post('/api/royal/sub-stools', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.createSubStoolHandler);
app.put('/api/royal/sub-stools/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.updateSubStoolHandler);
app.delete('/api/royal/sub-stools/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), royalController_1.deleteSubStoolHandler);
// Lookup Routes
app.get('/api/lookups/professions', lookupController_1.getProfessions);
app.get('/api/lookups/religions', lookupController_1.getReligions);
app.get('/api/lookups/employers', lookupController_1.getEmployers);
// Royal Ancestors Lookups
app.get('/api/people/royals/asantehenes', peopleController_1.getAsantehenesHandler);
app.get('/api/people/royals/asantehemaas', peopleController_1.getAsantehemaasHandler);
// Traditional Stools Routes
app.get('/api/traditional-stools', traditionalStoolController_1.getTraditionalStools);
app.get('/api/traditional-stools/:id', traditionalStoolController_1.getTraditionalStoolById);
app.post('/api/traditional-stools', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), traditionalStoolController_1.createTraditionalStool);
app.put('/api/traditional-stools/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), traditionalStoolController_1.updateTraditionalStool);
app.delete('/api/traditional-stools/:id', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin']), traditionalStoolController_1.deleteTraditionalStool);
app.post('/api/traditional-stools/:id/upload-image', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), traditionalStoolController_1.uploadStoolImage);
// Upload Routes
app.use('/api/upload', authMiddleware_1.authenticateJwt, (0, authMiddleware_1.requireRole)(['Admin', 'Manager']), uploadRoutes_1.default);
// Report Routes
app.get('/api/reports/lineage/:personId', reportController_1.getLineageReportHandler);
app.get('/api/reports/integrity', reportController_1.getDataIntegrityReportHandler);
app.get('/api/reports/biography/:personId', reportController_1.getBiographicalReportHandler);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    const errorMessage = err.message || 'An unexpected error occurred.';
    if (errorMessage.startsWith('Account not found')) {
        res.status(404).json({ error: errorMessage });
        return;
    }
    if (errorMessage.startsWith('Invalid credentials')) {
        res.status(401).json({ error: errorMessage });
        return;
    }
    // Custom categorizations based on exception messages
    if (errorMessage.includes('Validation Error') || errorMessage.includes('Chronological Error')) {
        res.status(400).json({ error: errorMessage });
        return;
    }
    if (errorMessage.includes('Graph Cycle Error')) {
        res.status(400).json({ error: errorMessage });
        return;
    }
    if (errorMessage.includes('Not Found')) {
        res.status(404).json({ error: errorMessage });
        return;
    }
    if (errorMessage.includes('Cannot delete') || errorMessage.includes('already taken')) {
        res.status(400).json({ error: errorMessage });
        return;
    }
    // Handle SQLite constraint violation (P2002 is Prisma unique constraint error code)
    if (err.code === 'P2002') {
        res.status(400).json({
            error: "Conflict Error: A record violating a unique constraint already exists."
        });
        return;
    }
    // Handle foreign key constraint failure (P2003)
    if (err.code === 'P2003') {
        res.status(400).json({
            error: "Validation Error: A foreign key constraint failed. Ensure referencing IDs are valid."
        });
        return;
    }
    console.error("Central Error Middleware Caught:", err);
    res.status(500).json({ error: errorMessage });
});
exports.default = app;
//# sourceMappingURL=app.js.map