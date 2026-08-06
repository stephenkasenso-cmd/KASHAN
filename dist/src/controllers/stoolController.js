"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStool = exports.createStool = exports.uploadStoolImage = exports.getStoolById = exports.getStools = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/stools
// Optional filters: clan, militaryWing, town
const getStools = async (req, res) => {
    try {
        const { clan, militaryWing, town } = req.query;
        // Build where clause
        const where = {};
        if (clan)
            where.clan = { contains: String(clan) };
        if (militaryWing)
            where.militaryWing = { contains: String(militaryWing) };
        if (town)
            where.town = { contains: String(town) };
        const stools = await prisma.paramountStool.findMany({
            where,
            orderBy: { id: 'asc' }
        });
        res.json(stools);
    }
    catch (error) {
        console.error("Failed to fetch paramount stools:", error);
        res.status(500).json({ error: "Failed to fetch paramount stools" });
    }
};
exports.getStools = getStools;
// GET /api/stools/:id
const getStoolById = async (req, res) => {
    try {
        const { id } = req.params;
        const stool = await prisma.paramountStool.findUnique({
            where: { id: parseInt(id) }
        });
        if (!stool) {
            return res.status(404).json({ error: "Stool not found" });
        }
        res.json(stool);
    }
    catch (error) {
        console.error("Failed to fetch stool details:", error);
        res.status(500).json({ error: "Failed to fetch stool details" });
    }
};
exports.getStoolById = getStoolById;
// POST /api/stools/:id/upload-image
const uploadStoolImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: "imageUrl is required in the request body" });
        }
        const updatedStool = await prisma.paramountStool.update({
            where: { id: parseInt(id) },
            data: { imageUrl }
        });
        res.json({ message: "Image updated successfully", stool: updatedStool });
    }
    catch (error) {
        console.error("Failed to update stool image:", error);
        res.status(500).json({ error: "Failed to update stool image" });
    }
};
exports.uploadStoolImage = uploadStoolImage;
// POST /api/stools
const createStool = async (req, res) => {
    try {
        const { town, stoolName, title, chiefName, clan, militaryWing, palaceName, seatLocation, enstoolmentDate, imageUrl } = req.body;
        if (!town || !stoolName || !title || !chiefName || !clan || !palaceName || !seatLocation) {
            return res.status(400).json({ error: "Validation Error: town, stoolName, title, chiefName, clan, palaceName, and seatLocation are required." });
        }
        const newStool = await prisma.paramountStool.create({
            data: {
                town,
                stoolName,
                title,
                chiefName,
                clan,
                militaryWing: militaryWing || null,
                palaceName,
                seatLocation,
                enstoolmentDate: enstoolmentDate ? new Date(enstoolmentDate) : null,
                imageUrl: imageUrl || null
            }
        });
        res.status(201).json(newStool);
    }
    catch (error) {
        console.error("Failed to create paramount stool:", error);
        res.status(500).json({ error: "Failed to create paramount stool" });
    }
};
exports.createStool = createStool;
// PUT /api/stools/:id
const updateStool = async (req, res) => {
    try {
        const { id } = req.params;
        const { town, stoolName, title, chiefName, clan, militaryWing, palaceName, seatLocation, enstoolmentDate, imageUrl } = req.body;
        const updatedStool = await prisma.paramountStool.update({
            where: { id: parseInt(id) },
            data: {
                town,
                stoolName,
                title,
                chiefName,
                clan,
                militaryWing,
                palaceName,
                seatLocation,
                enstoolmentDate: enstoolmentDate ? new Date(enstoolmentDate) : null,
                imageUrl: imageUrl !== undefined ? imageUrl : undefined
            }
        });
        res.json(updatedStool);
    }
    catch (error) {
        console.error("Failed to update stool:", error);
        res.status(500).json({ error: "Failed to update stool" });
    }
};
exports.updateStool = updateStool;
//# sourceMappingURL=stoolController.js.map