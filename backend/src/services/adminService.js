const Payments = require("../models/payments");
const Teams = require("../models/teams");
const TeamMember = require("../models/team_members");
const Notification = require("../models/notification");
const teamService = require("./teamService");
const Users = require("../models/user");

// 🔹 Lista todos os times com resumo financeiro (cards do admin)
async function listarTimesFinanceiros() {
  try {
    const teams = await Teams.find().lean();

    const teamsWithFinance = [];

    for (const team of teams) {
      const pagamentos = await Payments.find({ team_id: team._id }).lean();

      const totalPago = pagamentos.filter((p) => p.status === "paid").length;
      const totalPendente = pagamentos.filter(p => p.status === "unpaid").length;

      teamsWithFinance.push({
        _id: team._id,             // usado no front para Detalhes
        team_id: team._id,         // usado no front para Aviso / Deletar
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
}

// 🔹 Detalhes financeiros de um time (modal: membros Pago / Não pago)
// Usa Payments + populate em user_id para montar a lista de membros com status agregado.
async function getTeamFinanceById(teamId) {
  const team = await Teams.findById(teamId).lean();
  if (!team) throw new Error("Time não encontrado");

  // todos os pagamentos desse time, qualquer mês
  const payments = await Payments.find({ team_id: teamId })
    .populate("user_id", "nome")
    .lean();

  // uid -> { user_id, nome, status }
  const byUser = new Map();

  for (const p of payments) {
    const uid = String(p.user_id?._id || p.user_id);
    const nome = p.user_id?.nome || "Jogador";
    const s = p.status || "pending";

    if (!byUser.has(uid)) {
      byUser.set(uid, {
        user_id: uid,
        nome,
        status: s === "paid" ? "paid" : "unpaid",
      });
    } else {
      const cur = byUser.get(uid);
      if (s === "paid") cur.status = "paid";
    }
  }

  const members = Array.from(byUser.values());

  return {
    team: {
      _id: team._id,
      nome: team.nome,
    },
    members,
  };
}

// 🔹 Envia aviso administrativo para os REPRESENTANTES do time
// Usa o próprio documento de Teams (created_by + members com user_type 'representante_time')
async function notifyTeam(teamId) {
  const team = await Teams.findById(teamId).lean();
  if (!team) throw new Error("Time não encontrado");

  // pega todos firebaseUid de representantes daquele time
  const repFirebaseUids = new Set();

  if (
    team.created_by &&
    team.created_by.user_type === "representante_time" &&
    team.created_by.uid
  ) {
    repFirebaseUids.add(String(team.created_by.uid));
  }

  if (Array.isArray(team.members)) {
    for (const m of team.members) {
      if (m.user_type === "representante_time" && m.uid) {
        repFirebaseUids.add(String(m.uid));
      }
    }
  }

  const repUidsArray = Array.from(repFirebaseUids);
  if (repUidsArray.length === 0) {
    // não há representantes cadastrados nesse time
    return {
      team: team.nome,
      notified_count: 0,
    };
  }

  // converte firebaseUid -> _id dos Users
  const reps = await Users.find({ firebaseUid: { $in: repUidsArray } }).lean();
  if (reps.length === 0) {
    return {
      team: team.nome,
      notified_count: 0,
    };
  }

  const message = `Seu prazo de pagamento está se esgotando para o time ${team.nome}.`;

  const notificationsToInsert = reps.map((u) => ({
    user_id: u._id,
    team_id: teamId,
    title: "Aviso do administrador",
    message,
    viewed: false,
  }));

  await Notification.insertMany(notificationsToInsert);

  return {
    team: team.nome,
    notified_count: notificationsToInsert.length,
  };
}

// 🔹 Deleta time como admin
async function deleteTeamAsAdmin(teamId) {
  return await teamService.deletarTime(teamId);
}

module.exports = {
  listarTimesFinanceiros,
  getTeamFinanceById,
  notifyTeam,
  deleteTeamAsAdmin,
};
