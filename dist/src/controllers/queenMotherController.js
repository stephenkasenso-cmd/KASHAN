"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQueenMother = exports.updateQueenMother = exports.createQueenMother = exports.getQueenMotherById = exports.getQueenMothers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/queen-mothers
// Optional filters: categoryGroup, clan
const getQueenMothers = async (req, res) => {
    try {
        const { categoryGroup, clan } = req.query;
        const where = {};
        if (categoryGroup)
            where.categoryGroup = { contains: String(categoryGroup) };
        if (clan)
            where.clan = { contains: String(clan) };
        const queenMothers = await prisma.queenMotherStool.findMany({
            where,
            orderBy: { id: 'asc' }
        });
        res.json(queenMothers);
    }
    catch (error) {
        console.error("Failed to fetch queen mothers:", error);
        res.status(500).json({ error: "Failed to fetch queen mothers" });
    }
};
exports.getQueenMothers = getQueenMothers;
// GET /api/queen-mothers/:id
const getQueenMotherById = async (req, res) => {
    try {
        const { id } = req.params;
        const stool = await prisma.queenMotherStool.findUnique({
            where: { id: parseInt(id) }
        });
        if (!stool) {
            return res.status(404).json({ error: "Queen Mother stool not found" });
        }
        res.json(stool);
    }
    catch (error) {
        console.error("Failed to fetch queen mother details:", error);
        res.status(500).json({ error: "Failed to fetch queen mother details" });
    }
};
exports.getQueenMotherById = getQueenMotherById;
// POST /api/queen-mothers
const createQueenMother = async (req, res) => {
    try {
        const { title, queenName, jurisdiction, categoryGroup, clan, notes, enstoolmentDate, imageUrl } = req.body;
        if (!title || !queenName || !jurisdiction || !categoryGroup || !clan) {
            return res.status(400).json({
                error: "Validation Error: title, queenName, jurisdiction, categoryGroup, and clan are required."
            });
        }
        const newStool = await prisma.queenMotherStool.create({
            data: {
                title,
                queenName,
                jurisdiction,
                categoryGroup,
                clan,
                notes: notes || null,
                enstoolmentDate: enstoolmentDate ? new Date(enstoolmentDate) : null,
                imageUrl: imageUrl || null
            }
        });
        res.status(201).json(newStool);
    }
    catch (error) {
        console.error("Failed to create queen mother stool:", error);
        res.status(500).json({ error: "Failed to create queen mother stool" });
    }
};
exports.createQueenMother = createQueenMother;
// PUT /api/queen-mothers/:id
const updateQueenMother = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, queenName, jurisdiction, categoryGroup, clan, notes, enstoolmentDate, imageUrl } = req.body;
        const updatedStool = await prisma.queenMotherStool.update({
            where: { id: parseInt(id) },
            data: {
                title,
                queenName,
                jurisdiction,
                categoryGroup,
                clan,
                notes: notes !== undefined ? notes : undefined,
                enstoolmentDate: enstoolmentDate ? new Date(enstoolmentDate) : null,
                imageUrl: imageUrl !== undefined ? imageUrl : undefined
            }
        });
        res.json(updatedStool);
    }
    catch (error) {
        console.error("Failed to update queen mother stool:", error);
        res.status(500).json({ error: "Failed to update queen mother stool" });
    }
};
exports.updateQueenMother = updateQueenMother;
// DELETE /api/queen-mothers/:id
const deleteQueenMother = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.queenMotherStool.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Queen mother stool deleted successfully", stool: deleted });
    }
    catch (error) {
        console.error("Failed to delete queen mother stool:", error);
        res.status(500).json({ error: "Failed to delete queen mother stool" });
    }
};
exports.deleteQueenMother = deleteQueenMother;
//# sourceMappingURL=queenMotherController.js.map