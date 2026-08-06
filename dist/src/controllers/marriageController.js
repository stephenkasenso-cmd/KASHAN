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
exports.createMarriageHandler = createMarriageHandler;
exports.listMarriagesForPersonHandler = listMarriagesForPersonHandler;
exports.deleteMarriageHandler = deleteMarriageHandler;
const familyService = __importStar(require("../services/familyService"));
/**
 * Handle POST /api/marriages (Create a marriage record)
 */
async function createMarriageHandler(req, res, next) {
    try {
        const { spouse1Id, spouse2Id, marriageDate, marriagePlace } = req.body;
        if (!spouse1Id || !spouse2Id) {
            res.status(400).json({
                error: "Validation Error: 'spouse1Id' and 'spouse2Id' are required fields."
            });
            return;
        }
        const marriage = await familyService.createMarriage(Number(spouse1Id), Number(spouse2Id), marriageDate ? new Date(marriageDate) : null, marriagePlace || null);
        res.status(201).json(marriage);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle GET /api/marriages/person/:id (List marriages for a person)
 */
async function listMarriagesForPersonHandler(req, res, next) {
    try {
        const personId = parseInt(req.params.id, 10);
        if (isNaN(personId)) {
            res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
            return;
        }
        const marriages = await familyService.listMarriagesForPerson(personId);
        res.json(marriages);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle DELETE /api/marriages/:id (Delete a marriage record)
 */
async function deleteMarriageHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
            return;
        }
        const deleted = await familyService.deleteMarriage(id);
        res.json({ message: "Marriage record deleted successfully", marriage: deleted });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=marriageController.js.map