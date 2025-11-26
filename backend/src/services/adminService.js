const Payments = require("../models/payments");
const Teams = require("../models/teams");
const Users = require("../models/user");
const TeamMember = require("../models/team_members");
const Notification = require("../models/notification");
const teamService = require("./teamService");


  // 🔹 Busca todos os times com informações financeiras
async function listarTimesFinanceiros() {
  try {
    const teams = await Teams.find().lean();

    const teamsWithFinance = [];

    for (const team of teams) {
      const pagamentos = await Payments.find({ team_id: team._id }).lean();

      const totalPago = pagamentos.filter(p => p.status === "paid").length;
      const totalPendente = pagamentos.filter(p => p.status === "pending").length;

      teamsWithFinance.push({
        team_id: team._id,
        nome: team.nome,
        mensalidade: team.monthly_fee,
        total_pago: totalPago,
        total_pendente: totalPendente,
        total_registros: pagamentos.length,
      });
    }

    return teamsWithFinance;
  } catch (err) {
    console.error("[Service] Erro ao listar times financeiros:", err);
    throw new Error("Erro ao carregar dados financeiros");
  }
};

async function getTeamFinanceById(teamId) {
  // Verifica se o time existe
  const team = await Teams.findById(teamId);
  if (!team) throw new Error("Time não encontrado");

  // Buscar membros do time (join manual via populate)
  const members = await TeamMember.find({ team_id: teamId })
    .populate("user_id", "nome telefone user_type firebaseUid ativo");

  // Buscar pagamentos do time
  const payments = await Payments.find({ team_id: teamId })
    .populate("user_id", "nome user_type")
    .populate("confirmed_by", "nome");

  return {
    team,
    members,
    payments,
  };
}

async function notifyTeam(teamId) {

  const team = await Teams.findById(teamId);
  if (!team) throw new Error("Time não encontrado");

  // Buscar membros
  const members = await TeamMember.find({ team_id: teamId });

  if (members.length === 0)
    throw new Error("Este time não possui membros");

  const message = `O time ${team.nome} recebeu um novo aviso administrativo.`;

  const notificationsToInsert = members.map(member => ({
    user_id: member.user_id,
    team_id: teamId,
    title: "Aviso do administrador",
    message,
    viewed: false
  }));

  // Salva notificações
  await Notification.insertMany(notificationsToInsert);

  return {
    team: team.nome,
    notified_count: members.length
  };
}

async function deleteTeamAsAdmin(teamId) {
  return await teamService.deletarTime(teamId);
}

module.exports = {
  getTeamFinanceById,
  listarTimesFinanceiros,
  notifyTeam,
  deleteTeamAsAdmin
};
