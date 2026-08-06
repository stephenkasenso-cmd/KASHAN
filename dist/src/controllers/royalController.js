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
exports.deleteSubStoolHandler = exports.updateSubStoolHandler = exports.createSubStoolHandler = exports.deleteParamountcyHandler = exports.updateParamountcyHandler = exports.createParamountcyHandler = exports.deleteRegionHandler = exports.updateRegionHandler = exports.createRegionHandler = exports.listSubStoolsHandler = exports.listParamountciesHandler = exports.listRegionsHandler = exports.listClansHandler = void 0;
const familyService_1 = require("../services/familyService");
const listClansHandler = async (req, res) => {
    try {
        const clans = await (0, familyService_1.getClans)();
        res.json(clans);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch clans' });
    }
};
exports.listClansHandler = listClansHandler;
const listRegionsHandler = async (req, res) => {
    try {
        const regions = await (0, familyService_1.getRegions)();
        res.json(regions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
};
exports.listRegionsHandler = listRegionsHandler;
const listParamountciesHandler = async (req, res) => {
    try {
        const paramountcies = await (0, familyService_1.getParamountcies)();
        res.json(paramountcies);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch paramountcies' });
    }
};
exports.listParamountciesHandler = listParamountciesHandler;
const listSubStoolsHandler = async (req, res) => {
    try {
        const subStools = await (0, familyService_1.getSubStools)();
        res.json(subStools);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sub-stools' });
    }
};
exports.listSubStoolsHandler = listSubStoolsHandler;
const createRegionHandler = async (req, res, next) => {
    try {
        const { createRegion } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        const region = await createRegion(req.body.name);
        res.status(201).json(region);
    }
    catch (error) {
        next(error);
    }
};
exports.createRegionHandler = createRegionHandler;
const updateRegionHandler = async (req, res, next) => {
    try {
        const { updateRegion } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        const region = await updateRegion(Number(req.params.id), req.body.name);
        res.json(region);
    }
    catch (error) {
        next(error);
    }
};
exports.updateRegionHandler = updateRegionHandler;
const deleteRegionHandler = async (req, res, next) => {
    try {
        const { deleteRegion } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        await deleteRegion(Number(req.params.id));
        res.json({ message: 'Region deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRegionHandler = deleteRegionHandler;
const createParamountcyHandler = async (req, res, next) => {
    try {
        const { createParamountcy } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        const param = await createParamountcy(req.body.name, Number(req.body.regionId));
        res.status(201).json(param);
    }
    catch (error) {
        next(error);
    }
};
exports.createParamountcyHandler = createParamountcyHandler;
const updateParamountcyHandler = async (req, res, next) => {
    try {
        const { updateParamountcy } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        const param = await updateParamountcy(Number(req.params.id), req.body.name, Number(req.body.regionId));
        res.json(param);
    }
    catch (error) {
        next(error);
    }
};
exports.updateParamountcyHandler = updateParamountcyHandler;
const deleteParamountcyHandler = async (req, res, next) => {
    try {
        const { deleteParamountcy } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        await deleteParamountcy(Number(req.params.id));
        res.json({ message: 'Paramountcy deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteParamountcyHandler = deleteParamountcyHandler;
const createSubStoolHandler = async (req, res, next) => {
    try {
        const { createSubStool } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        const stool = await createSubStool(req.body.name, Number(req.body.paramountcyId));
        res.status(201).json(stool);
    }
    catch (error) {
        next(error);
    }
};
exports.createSubStoolHandler = createSubStoolHandler;
const updateSubStoolHandler = async (req, res, next) => {
    try {
        const { updateSubStool } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        const stool = await updateSubStool(Number(req.params.id), req.body.name, Number(req.body.paramountcyId));
        res.json(stool);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubStoolHandler = updateSubStoolHandler;
const deleteSubStoolHandler = async (req, res, next) => {
    try {
        const { deleteSubStool } = await Promise.resolve().then(() => __importStar(require('../services/familyService')));
        await deleteSubStool(Number(req.params.id));
        res.json({ message: 'Sub-Stool deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubStoolHandler = deleteSubStoolHandler;
//# sourceMappingURL=royalController.js.map