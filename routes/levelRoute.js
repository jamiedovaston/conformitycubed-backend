const { getAllLevels, uploadLevel, getLevel } = require("../services/level");

const express = require('express');
const router = express.Router();

router.post('/upload', async (req, res) => {

    if (!req.session.steamId)
        return res.status(401).json({ error: "Not authenticated" });

    const { name, description, tags, level } = req.body;

    if (!name || !level)
        return res.status(400).json({ error: "Missing required fields" });

    try {

        const result = await uploadLevel(
            req.session.steamId,
            name,
            description,
            tags,
            level
        );

        res.json({
            levelId: result.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload level" });
    }
});

router.get('/get', async (req, res) => {
    try {
        const { id } = req.query;

        if (id) {
            const level = await getLevel(id);

            if (!level) {
                return res.status(404).json({ error: "Level not found" });
            }

            return res.json({ level });
        }

        const levels = await getAllLevels();

        res.json({ levels });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get levels" });
    }
});



module.exports = router;