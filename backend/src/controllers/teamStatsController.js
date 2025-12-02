const teamStatsService = require("../services/teamStatsService");

async function getTeamStats(req, res) {
  try {
    const { teamId } = req.params;
    const stats = await teamStatsService.getTeamStats(teamId);
    res.status(200).json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getTeamStats
};
