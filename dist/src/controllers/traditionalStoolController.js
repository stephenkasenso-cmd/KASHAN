"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStoolImage = exports.deleteTraditionalStool = exports.updateTraditionalStool = exports.createTraditionalStool = exports.getTraditionalStoolById = exports.getTraditionalStools = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/traditional-stools
// Optional filters: rank, category, region, clan, parentStoolId, town
const getTraditionalStools = async (req, res) => {
    try {
        const { rank, category, region, clan, parentStoolId, town } = req.query;
        const where = {};
        if (rank)
            where.rank = String(rank);
        if (category)
            where.category = String(category);
        if (region)
            where.region = { contains: String(region) };
        if (clan)
            where.clan = { contains: String(clan) };
        if (town)
            where.town = { contains: String(town) };
        if (parentStoolId) {
            if (parentStoolId === 'null') {
                where.parentStoolId = null;
            }
            else {
                where.parentStoolId = parseInt(String(parentStoolId), 10);
            }
        }
        const stools = await prisma.traditionalStool.findMany({
            where,
            include: {
                parentStool: true,
                queenMotherStool: true,
                chiefStool: true
            },
            orderBy: { id: 'asc' }
        });
        res.json(stools);
    }
    catch (error) {
        console.error("Failed to fetch traditional stools:", error);
        res.status(500).json({ error: "Failed to fetch traditional stools" });
    }
};
exports.getTraditionalStools = getTraditionalStools;
// GET /api/traditional-stools/:id
const getTraditionalStoolById = async (req, res) => {
    try {
        const { id } = req.params;
        const stool = await prisma.traditionalStool.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                parentStool: true,
                subStools: {
                    include: {
                        queenMotherStool: true,
                        chiefStool: true
                    }
                },
                queenMotherStool: true,
                chiefStool: true
            }
        });
        if (!stool) {
            return res.status(404).json({ error: "Traditional Stool not found" });
        }
        res.json(stool);
    }
    catch (error) {
        console.error("Failed to fetch traditional stool details:", error);
        res.status(500).json({ error: "Failed to fetch traditional stool details" });
    }
};
exports.getTraditionalStoolById = getTraditionalStoolById;
// POST /api/traditional-stools
const createTraditionalStool = async (req, res) => {
    try {
        const { stoolName, title, town, region, category, rank, currentOccupant, clan, palaceName, seatLocation, enstoolmentDate, imageUrl, militaryWing, parentStoolId, queenMotherStoolId } = req.body;
        if (!stoolName || !title || !town || !region || !rank) {
            return res.status(400).json({
                error: "Validation Error: stoolName, title, town, region, and rank are required."
            });
        }
        const data = {
            stoolName,
            title,
            town,
            region,
            category: category || "REGIONAL_PARAMOUNT",
            rank,
            currentOccupant: currentOccupant || null,
            clan: clan || null,
            palaceName: palaceName || null,
            seatLocation: seatLocation || null,
            enstoolmentDate: enstoolmentDate ? new Date(enstoolmentDate) : null,
            imageUrl: imageUrl || null,
            militaryWing: militaryWing || null
        };
        if (parentStoolId) {
            data.parentStoolId = parseInt(parentStoolId, 10);
        }
        if (queenMotherStoolId) {
            data.queenMotherStoolId = parseInt(queenMotherStoolId, 10);
        }
        const newStool = await prisma.traditionalStool.create({
            data,
            include: {
                parentStool: true,
                queenMotherStool: true,
                chiefStool: true
            }
        });
        res.status(201).json(newStool);
    }
    catch (error) {
        console.error("Failed to create traditional stool:", error);
        res.status(500).json({ error: "Failed to create traditional stool" });
    }
};
exports.createTraditionalStool = createTraditionalStool;
// PUT /api/traditional-stools/:id
const updateTraditionalStool = async (req, res) => {
    try {
        const { id } = req.params;
        const { stoolName, title, town, region, category, rank, currentOccupant, clan, palaceName, seatLocation, enstoolmentDate, imageUrl, militaryWing, parentStoolId, queenMotherStoolId } = req.body;
        const data = {
            stoolName,
            title,
            town,
            region,
            category,
            rank,
            currentOccupant: currentOccupant !== undefined ? currentOccupant : undefined,
            clan: clan !== undefined ? clan : undefined,
            palaceName: palaceName !== undefined ? palaceName : undefined,
            seatLocation: seatLocation !== undefined ? seatLocation : undefined,
            enstoolmentDate: enstoolmentDate ? new Date(enstoolmentDate) : (enstoolmentDate === null ? null : undefined),
            imageUrl: imageUrl !== undefined ? imageUrl : undefined,
            militaryWing: militaryWing !== undefined ? militaryWing : undefined
        };
        if (parentStoolId !== undefined) {
            data.parentStoolId = parentStoolId ? parseInt(parentStoolId, 10) : null;
        }
        if (queenMotherStoolId !== undefined) {
            data.queenMotherStoolId = queenMotherStoolId ? parseInt(queenMotherStoolId, 10) : null;
        }
        const updated = await prisma.traditionalStool.update({
            where: { id: parseInt(id, 10) },
            data,
            include: {
                parentStool: true,
                queenMotherStool: true,
                chiefStool: true
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Failed to update traditional stool:", error);
        res.status(500).json({ error: "Failed to update traditional stool" });
    }
};
exports.updateTraditionalStool = updateTraditionalStool;
// DELETE /api/traditional-stools/:id
const deleteTraditionalStool = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.traditionalStool.delete({
            where: { id: parseInt(id, 10) }
        });
        res.json({ message: "Traditional Stool deleted successfully", stool: deleted });
    }
    catch (error) {
        console.error("Failed to delete traditional stool:", error);
        res.status(500).json({ error: "Failed to delete traditional stool" });
    }
};
exports.deleteTraditionalStool = deleteTraditionalStool;
// POST /api/traditional-stools/:id/upload-image
const uploadStoolImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: "imageUrl is required in the request body" });
        }
        const updated = await prisma.traditionalStool.update({
            where: { id: parseInt(id, 10) },
            data: { imageUrl }
        });
        res.json({ message: "Image updated successfully", stool: updated });
    }
    catch (error) {
        console.error("Failed to update stool image:", error);
        res.status(500).json({ error: "Failed to update stool image" });
    }
};
exports.uploadStoolImage = uploadStoolImage;
//# sourceMappingURL=traditionalStoolController.js.map