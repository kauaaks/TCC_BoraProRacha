const Payments = require("../models/payments");
const Teams = require("../models/teams");
const TeamMember = require("../models/team_members");
const Notification = require("../models/notification");
const teamService = require("./teamService");
const Users = require("../models/user");
const admin = require("../config/firebase"); // Firebase Admin SDK
const userService = require("./userService"); // onde está criarUsuario
const paymentService = require("./paymentService"); // este arquivo acima

// helper para YYYY-MM do mês atual
function getCurrentMonth() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

// 🔹 Lista todos os times com resumo financeiro (cards do admin)
async function listarTimesFinanceiros() {
  try {
    const teams = await Teams.find().lean();
    const month = getCurrentMonth();

    const teamsWithFinance = [];

    for (const team of teams) {
      // garante payments para TODOS os membros deste time no mês atual
      try {
        await paymentService.listarPorTimeEMes({ team_id: team._id, month });
      } catch (e) {
        console.error(
          "[Service] listarPorTimeEMes em listarTimesFinanceiros falhou:",
          e?.message
        );
      }

      const pagamentos = await Payments.find({ team_id: team._id }).lean();

      const totalPago = pagamentos.filter((p) => p.status === "paid").length;
      const totalPendente = pagamentos.filter((p) => p.status === "unpaid").length;

      teamsWithFinance.push({
        _id: team._id, // usado no front para Detalhes
        team_id: team._id, // usado no front para Aviso / Deletar
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

// 🔹 Detalhes financeiros de um time
async function getTeamFinanceById(teamId) {
  const team = await Teams.findById(teamId).lean();
  if (!team) throw new Error("Time não encontrado");

  // garante que todos os membros tenham Payment para o mês atual
  const month = getCurrentMonth();
  try {
    await paymentService.listarPorTimeEMes({ team_id: teamId, month });
  } catch (e) {
    console.error("[Service] listarPorTimeEMes falhou (admin):", e?.message);
  }

  const payments = await Payments.find({ team_id: teamId })
    .populate("user_id", "nome")
    .lean();

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
async function notifyTeam(teamId) {
  const team = await Teams.findById(teamId).lean();
  if (!team) throw new Error("Time não encontrado");

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
    return {
      team: team.nome,
      notified_count: 0,
    };
  }

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

// 🔹 Admin cria usuário no Firebase + Mongo e opcionalmente vincula a um time
// Espera: { nome, telefone, user_type, email, password, team_id? }
async function criarUsuarioAdmin({
  nome,
  telefone,
  user_type,
  email,
  password,
  team_id,
}) {
  if (!nome || !telefone || !user_type || !email || !password) {
    const error = new Error(
      "nome, telefone, user_type, email e password são obrigatórios"
    );
    error.status = 400;
    throw error;
  }

  // 1. Cria usuário no Firebase (Admin SDK)
  const fbUser = await admin.auth().createUser({
    email,
    password,
    displayName: nome,
  });

  const firebaseUid = fbUser.uid;

  // 2. Cria usuário no Mongo usando sua service atual
  const created = await userService.criarUsuario({
    nome,
    telefone,
    user_type,
    firebaseUid,
  });

  const user = created.user || created; // compatibilidade

  // 3. Se tiver team_id e for jogador/representante, vincula no time
  if (team_id && ["jogador", "representante_time"].includes(user_type)) {
    const team = await Teams.findById(team_id);
    if (!team) {
      const error = new Error("Time informado não foi encontrado");
      error.status = 404;
      throw error;
    }

    if (!Array.isArray(team.members)) team.members = [];

    const jaMembro = team.members.some(
      (m) => String(m.uid) === String(firebaseUid)
    );

    if (!jaMembro) {
      team.members.push({
        uid: firebaseUid,
        user_type,
      });
      await team.save();
    }

    // já garante payments do mês atual para esse time
    try {
      const month = getCurrentMonth();
      await paymentService.listarPorTimeEMes({ team_id: team_id, month });
    } catch (e) {
      console.error(
        "[Service] listarPorTimeEMes após criarUsuarioAdmin falhou:",
        e?.message
      );
    }
  }

  return { user, firebaseUid };
}

module.exports = {
  listarTimesFinanceiros,
  getTeamFinanceById,
  notifyTeam,
  deleteTeamAsAdmin,
  criarUsuarioAdmin,
};
