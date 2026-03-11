const { getAllLevels, uploadLevel } = require("../services/level");

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
        const levels = await getAllLevels();

        res.json({
            levels
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get all levels" });
    }
});

module.exports = router;