const express = require('express');
const router = express.Router();
const { AccessToken } = require('livekit-server-sdk');
const auth = require('../middleware/auth');

const livekitApiKey = 'devkey';
const livekitApiSecret = 'secret';

router.post('/token', auth, async (req, res) => {
    const { roomName, participantName } = req.body;
    console.log('Request to /api/v1/video/token');
    console.log('roomName:', roomName);
    console.log('participantName:', participantName);

    if (!roomName || !participantName) {
        return res.status(400).json({ msg: 'roomName and participantName are required' });
    }

    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
        identity: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    console.log('Generated LiveKit Token:', token);

    res.json({ token: token });
});

module.exports = router;
