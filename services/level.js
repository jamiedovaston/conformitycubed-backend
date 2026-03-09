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

module.exports = { uploadLevel };