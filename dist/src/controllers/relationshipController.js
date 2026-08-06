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
exports.createRelationshipHandler = createRelationshipHandler;
exports.updateRelationshipHandler = updateRelationshipHandler;
exports.deleteRelationshipHandler = deleteRelationshipHandler;
exports.listRelationshipsForPersonHandler = listRelationshipsForPersonHandler;
const familyService = __importStar(require("../services/familyService"));
/**
 * Handle POST /api/relationships (Link two people together)
 */
async function createRelationshipHandler(req, res, next) {
    try {
        const { person_id_1, person_id_2, relationship_type, subtype, status, start_date, end_date } = req.body;
        if (person_id_1 === undefined || person_id_2 === undefined || !relationship_type) {
            res.status(400).json({
                error: "Validation Error: 'person_id_1', 'person_id_2', and 'relationship_type' are required fields."
            });
            return;
        }
        const p1 = parseInt(person_id_1, 10);
        const p2 = parseInt(person_id_2, 10);
        if (isNaN(p1) || isNaN(p2)) {
            res.status(400).json({
                error: "Validation Error: 'person_id_1' and 'person_id_2' must be valid integers."
            });
            return;
        }
        const relationship = await familyService.addRelationship(p1, p2, relationship_type, subtype || 'None', status || null, start_date ? new Date(start_date) : null, end_date ? new Date(end_date) : null);
        res.status(201).json(relationship);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle PUT /api/relationships/:id (Update a relationship)
 */
async function updateRelationshipHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Validation Error: 'id' must be a valid integer." });
            return;
        }
        const { relationship_type, subtype, status, start_date, end_date } = req.body;
        if (!relationship_type) {
            res.status(400).json({ error: "Validation Error: 'relationship_type' is required." });
            return;
        }
        const updated = await familyService.updateRelationship(id, relationship_type, subtype || 'None', status || null, start_date ? new Date(start_date) : null, end_date ? new Date(end_date) : null);
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle DELETE /api/relationships/:id (Remove a relationship)
 */
async function deleteRelationshipHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Validation Error: 'id' must be a valid integer." });
            return;
        }
        const deleted = await familyService.deleteRelationship(id);
        res.status(200).json({ message: 'Relationship deleted successfully.', deleted });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle GET /api/people/:id/relationships (List all relationships for a person)
 */
async function listRelationshipsForPersonHandler(req, res, next) {
    try {
        const personId = parseInt(req.params.id, 10);
        if (isNaN(personId)) {
            res.status(400).json({ error: "Validation Error: 'id' must be a valid integer." });
            return;
        }
        const relationships = await familyService.getRelationshipsForPerson(personId);
        res.status(200).json(relationships);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=relationshipController.js.map