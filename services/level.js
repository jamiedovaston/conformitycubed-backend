const pool = require('../db');

async function uploadLevel(steamId, name, description, tags, levelData) {

    const result = await pool.query(
        `INSERT INTO levels (steam_id, name, description, tags, level_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [steamId, name, description, tags, levelData]
    );

    return result.rows[0];
}

async function getAllLevels() {

    const result = await pool.query(
        `SELECT id, steam_id, name, description, tags, created_at
         FROM levels
         ORDER BY created_at DESC`
    );

    return result.rows;
}

module.exports = { uploadLevel, getAllLevels };