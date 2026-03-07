const pool = require('../db');

async function getOrCreateUser(steamId) {

    const result = await pool.query(
        `INSERT INTO users (steam_id)
        VALUES ($1)
        ON CONFLICT (steam_id) DO NOTHING
        RETURNING steam_id`,
        [steamId]
    );

    return {
        steamId,
        isNewUser: result.rowCount > 0
    };
}

module.exports = { getOrCreateUser };