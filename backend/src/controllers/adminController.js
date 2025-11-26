const adminService = require("../services/adminService");


async function listarTimesFinanceiros(req, res) {
  try {
    const dados = await adminService.listarTimesFinanceiros();

    res.status(200).json({
      success: true,
      teams: dados
    });
  } catch (err) {
    console.error("[Controller] Erro em listarTimesFinanceiros:", err);
    res.status(500).json({ error: err.message });
  }
};


async function getTeamFinanceById(req, res) {
  try {
    const { id } = req.params;

    const data = await adminService.getTeamFinanceById(id);

    res.status(200).json(data);
  } catch (error) {
    console.error("[Controller] Erro ao buscar finanças:", error);
    res.status(500).json({ error: error.message });
  }
}

async function notifyTeam(req, res) {
  try {
    const { teamId } = req.params;
    const result = await adminService.notifyTeam(teamId);

    res.status(200).json({
      message: "Aviso registrado no sistema",
      result
    });
  } catch (err) {
    console.error("[Controller notifyTeam] Erro:", err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteTeam(req, res) {
  try {
    await adminService.deleteTeamAsAdmin(req.params.id);
    return res.status(200).json({ message: "Time deletado com sucesso" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


module.exports = {
  getTeamFinanceById,
  listarTimesFinanceiros,
  notifyTeam,
  deleteTeam
};
