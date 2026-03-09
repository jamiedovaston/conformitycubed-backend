require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const { getOrCreateUser } = require('./services/users');
const { uploadLevel } = require('./services/level');

const app = express();

app.use(express.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 },
    rolling: true
}));

const PORT = process.env.PORT;
const IP = process.env.IP;

app.listen(PORT, IP, () => {
    console.log(`Server running on http://${IP}:${PORT}`);
});

app.get('/ping', (req, res) => {
    res.status(200).json({
        message: 'pong',
    });
});

app.post('/auth', async (req, res) => {
    const { ticket } = req.body;

    if(!ticket) return res.status(400).json({ error: 'No ticket provided!' });

    try {
        const params = new URLSearchParams({
            key: process.env.STEAM_PUBLISHER_KEY,
            appid: process.env.STEAM_APP_ID,
            ticket: ticket,
            identity: process.env.STEAM_IDENTITY
        });

        const steamRes = await fetch(`https://partner.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/?${params}`);

        if (!steamRes.ok) {
            const text = await steamRes.text();
            console.error("Steam API returned:", text);
            return res.status(steamRes.status).json({ error: text });
        }

        const data = await steamRes.json();

        if (!data?.response?.params?.steamid)
            return res.status(401).json({ error: 'Invalid Steam ticket' });

        const steamId = data.response.params.steamid;
        const { isNewUser } = await getOrCreateUser(steamId);

        req.session.steamId = steamId;

        return res.json({
            steamId,
            isNewUser
        });
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({ error: 'Steam authentication failed' });
    }
});

app.post('/end-session', (req, res) => {
    if (!req.session.steamId) {
        return res.status(401).json({ error: "No active session" });
    }

    const steamId = req.session.steamId;

    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ error: "Failed to end session" });
        }

        res.clearCookie('connect.sid');
        return res.json();
    });
});

app.post('/levels/upload', async (req, res) => {

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
            success: true,
            levelId: result.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload level" });
    }
});