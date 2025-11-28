const adminStatsService = require("../services/adminStatsService");

async function getOverview(req, res) {
  try {
    const stats = await adminStatsService.getAdminOverviewStats();
    return res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (err) {
    console.error("[Controller] Erro em getOverview:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function getTeamsByRegion(req, res) {
  try {
    const data = await adminStatsService.getTeamsAndPlayersByRegion();
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error("[Controller] Erro em getTeamsByRegion:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function getRegionDetail(req, res) {
  try {
    const { region } = req.params;
    const data = await adminStatsService.getRegionDetail(region);
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error("[Controller] Erro em getRegionDetail:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getOverview,
  getTeamsByRegion,
  getRegionDetail,
};
