const playerStatsService = require("../services/playerStatsService");

async function getMyPlayerStats(req, res) {
  try {
    const firebaseUid = req.user.uid;
    const data = await playerStatsService.getPlayerStats(firebaseUid);
    return res.status(200).json(data);
  } catch (err) {
    console.error("[getMyPlayerStats]", err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getMyPlayerStats,
};
