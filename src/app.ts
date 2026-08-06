import express, { Request, Response, NextFunction } from 'express';
import { 
  createPersonHandler, 
  getImmediateFamilyHandler, 
  getAncestorsHandler, 
  getDescendantsHandler, 
  listPeopleHandler, 
  updatePersonHandler, 
  deletePersonHandler,
  getAsantehenesHandler,
  getAsantehemaasHandler,
  getDynasticSuccessionChainHandler,
  getMatrilinealTreeHandler,
  getDynasticPeerChainHandler
} from './controllers/peopleController';
import { 
  createRelationshipHandler, 
  updateRelationshipHandler, 
  deleteRelationshipHandler, 
  listRelationshipsForPersonHandler,
  establishRelationshipHandler,
  getAvailableTypesHandler
} from './controllers/relationshipController';
import { 
  getLineageReportHandler, 
  getDataIntegrityReportHandler, 
  getBiographicalReportHandler 
} from './controllers/reportController';
import { 
  loginHandler, 
  googleLoginHandler, 
  getCurrentUserHandler, 
  listUsersHandler, 
  createUserHandler, 
  updateUserHandler, 
  deleteUserHandler 
} from './controllers/userController';
import { 
  listClansHandler, 
  listRegionsHandler, createRegionHandler, updateRegionHandler, deleteRegionHandler,
  listParamountciesHandler, createParamountcyHandler, updateParamountcyHandler, deleteParamountcyHandler,
  listSubStoolsHandler, createSubStoolHandler, updateSubStoolHandler, deleteSubStoolHandler 
} from './controllers/royalController';
import {
  getTraditionalStools,
  getTraditionalStoolById,
  createTraditionalStool,
  updateTraditionalStool,
  deleteTraditionalStool,
  uploadStoolImage
} from './controllers/traditionalStoolController';
import { getProfessions, getReligions, getEmployers } from './controllers/lookupController';
import {
  createMarriageHandler,
  listMarriagesForPersonHandler,
  deleteMarriageHandler
} from './controllers/marriageController';
import { seedDefaultUsers } from './services/userService';
import uploadRoutes from './routes/uploadRoutes';
import { authenticateJwt, requireRole } from './middleware/authMiddleware';

const app = express();

// Parse incoming JSON requests
app.use(express.json({ limit: '10mb' }));

// Auto-seed default users
seedDefaultUsers().catch(err => {
  console.error("Failed to seed default users:", err);
});

// Auth API Routes
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/google', googleLoginHandler);
app.get('/api/auth/me', getCurrentUserHandler);

// User Management Routes
app.get('/api/users', authenticateJwt, requireRole(['Admin']), listUsersHandler);
app.post('/api/users', authenticateJwt, requireRole(['Admin']), createUserHandler);
app.put('/api/users/:id', authenticateJwt, requireRole(['Admin']), updateUserHandler);
app.delete('/api/users/:id', authenticateJwt, requireRole(['Admin']), deleteUserHandler);

// API Routes (Individual Registrations & Family Trees)
app.get('/api/people', listPeopleHandler);
app.post('/api/people', authenticateJwt, requireRole(['Admin', 'Manager']), createPersonHandler);
app.put('/api/people/:id', authenticateJwt, requireRole(['Admin', 'Manager']), updatePersonHandler);
app.delete('/api/people/:id', authenticateJwt, requireRole(['Admin', 'Manager']), deletePersonHandler);
app.get('/api/people/:id/family', getImmediateFamilyHandler);
app.get('/api/people/:id/ancestors', getAncestorsHandler);
app.get('/api/people/:id/descendants', getDescendantsHandler);
app.post('/api/relationships', authenticateJwt, requireRole(['Admin']), createRelationshipHandler);
app.post('/api/relationships/establish', authenticateJwt, requireRole(['Admin', 'Manager']), establishRelationshipHandler);
app.get('/api/relationships/available-types', getAvailableTypesHandler);
app.put('/api/relationships/:id', authenticateJwt, requireRole(['Admin']), updateRelationshipHandler);
app.delete('/api/relationships/:id', authenticateJwt, requireRole(['Admin', 'Manager']), deleteRelationshipHandler);
app.get('/api/people/:id/relationships', listRelationshipsForPersonHandler);

// Marriage Routes
app.post('/api/marriages', authenticateJwt, requireRole(['Admin', 'Manager']), createMarriageHandler);
app.get('/api/marriages/person/:id', listMarriagesForPersonHandler);
app.delete('/api/marriages/:id', authenticateJwt, requireRole(['Admin']), deleteMarriageHandler);

// Royal Routes
app.get('/api/royal/clans', listClansHandler);

app.get('/api/royal/regions', listRegionsHandler);
app.post('/api/royal/regions', authenticateJwt, requireRole(['Admin']), createRegionHandler);
app.put('/api/royal/regions/:id', authenticateJwt, requireRole(['Admin']), updateRegionHandler);
app.delete('/api/royal/regions/:id', authenticateJwt, requireRole(['Admin']), deleteRegionHandler);

app.get('/api/royal/paramountcies', listParamountciesHandler);
app.post('/api/royal/paramountcies', authenticateJwt, requireRole(['Admin']), createParamountcyHandler);
app.put('/api/royal/paramountcies/:id', authenticateJwt, requireRole(['Admin']), updateParamountcyHandler);
app.delete('/api/royal/paramountcies/:id', authenticateJwt, requireRole(['Admin']), deleteParamountcyHandler);

app.get('/api/royal/sub-stools', listSubStoolsHandler);
app.post('/api/royal/sub-stools', authenticateJwt, requireRole(['Admin']), createSubStoolHandler);
app.put('/api/royal/sub-stools/:id', authenticateJwt, requireRole(['Admin']), updateSubStoolHandler);
app.delete('/api/royal/sub-stools/:id', authenticateJwt, requireRole(['Admin']), deleteSubStoolHandler);

// Lookup Routes
app.get('/api/lookups/professions', getProfessions);
app.get('/api/lookups/religions', getReligions);
app.get('/api/lookups/employers', getEmployers);

// Royal Ancestors Lookups
app.get('/api/people/royals/asantehenes', getAsantehenesHandler);
app.get('/api/people/royals/asantehemaas', getAsantehemaasHandler);
app.get('/api/family/asantehene/succession-chain', getDynasticSuccessionChainHandler);
app.get('/api/family/asantehene/:id/matrilineal-tree', getMatrilinealTreeHandler);
app.get('/api/royals/asantehene/peer-chain', getDynasticPeerChainHandler);
app.get('/api/family/asantehene/peer-chain', getDynasticPeerChainHandler);

// Traditional Stools Routes
app.get('/api/traditional-stools', getTraditionalStools);
app.get('/api/traditional-stools/:id', getTraditionalStoolById);
app.post('/api/traditional-stools', authenticateJwt, requireRole(['Admin', 'Manager']), createTraditionalStool);
app.put('/api/traditional-stools/:id', authenticateJwt, requireRole(['Admin', 'Manager']), updateTraditionalStool);
app.delete('/api/traditional-stools/:id', authenticateJwt, requireRole(['Admin']), deleteTraditionalStool);
app.post('/api/traditional-stools/:id/upload-image', authenticateJwt, requireRole(['Admin', 'Manager']), uploadStoolImage);

// Upload Routes
app.use('/api/upload', authenticateJwt, requireRole(['Admin', 'Manager']), uploadRoutes);

// Report Routes
app.get('/api/reports/lineage/:personId', getLineageReportHandler);
app.get('/api/reports/integrity', getDataIntegrityReportHandler);
app.get('/api/reports/biography/:personId', getBiographicalReportHandler);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

export default app;
