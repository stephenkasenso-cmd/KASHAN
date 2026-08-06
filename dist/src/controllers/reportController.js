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
exports.getLineageReportHandler = getLineageReportHandler;
exports.getDataIntegrityReportHandler = getDataIntegrityReportHandler;
exports.getBiographicalReportHandler = getBiographicalReportHandler;
const reportService = __importStar(require("../services/reportService"));
/**
 * Handle GET /api/reports/lineage/:personId
 */
async function getLineageReportHandler(req, res, next) {
    try {
        const personId = parseInt(req.params.personId, 10);
        if (isNaN(personId)) {
            res.status(400).json({ error: "Validation Error: 'personId' parameter must be a valid integer." });
            return;
        }
        const report = await reportService.generateLineageSummary(personId);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle GET /api/reports/integrity
 */
async function getDataIntegrityReportHandler(req, res, next) {
    try {
        const report = await reportService.runDataIntegrityCheck();
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Handle GET /api/reports/biography/:personId
 */
async function getBiographicalReportHandler(req, res, next) {
    try {
        const personId = parseInt(req.params.personId, 10);
        if (isNaN(personId)) {
            res.status(400).json({ error: "Validation Error: 'personId' parameter must be a valid integer." });
            return;
        }
        const report = await reportService.compileBiographicalTimeline(personId);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=reportController.js.map