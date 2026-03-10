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

async function getSteamProfile(steamId)
{
    const params = new URLSearchParams({
        key: process.env.STEAM_PUBLISHER_KEY,
        steamids: steamId
    });

    const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${params}`
    );

    const data = await response.json();

    const player = data.response.players[0];

    return {
        player
    };
}

module.exports = { getOrCreateUser };