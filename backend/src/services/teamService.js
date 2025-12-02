const teams = require('../models/teams');
const user = require('../models/user');

function toUidArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((x) => {
      if (typeof x === "string" || typeof x === "number") return String(x);
      if (x && typeof x === "object") return String(x.firebaseUid || x.uid || x._id || x.id || "");
      return "";
    })
    .filter(Boolean);
}

function normalizeTeam(doc) {
  if (!doc) return null;

  const created_by_uid =
    doc.created_by_firebaseUid
      ? String(doc.created_by_firebaseUid)
      : (typeof doc.created_by === "string"
          ? String(doc.created_by)
          : (doc.created_by && typeof doc.created_by === "object"
              ? String(doc.created_by.uid || doc.created_by.firebaseUid || doc.created_by._id || doc.created_by.id || "")
              : ""));

  return {
    id: String(doc._id),
    nome: doc.nome || doc.name || "",
    description: doc.description || "",
    monthly_fee: Number(doc.monthly_fee ?? doc.monthlyFee ?? 0),
    member_count:
      doc.member_count ??
      doc.membersCount ??
      (Array.isArray(doc.members) ? doc.members.length : 0),
    is_active:
      typeof doc.is_active === "boolean" ? doc.is_active : doc.isActive ?? true,
    created_at: doc.created_at || doc.createdAt || new Date(),
    created_by_firebaseUid: created_by_uid,
    representatives: toUidArray(doc.representatives),
    members: toUidArray(doc.members),
    logo_url: doc.logo_url || "",
  };
}

function toYearMonth(d) {
  const dt = new Date(d || Date.now());
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function firstMonthForTeam(teamDoc) {
  const base =
    teamDoc?.next_payment_date ||
    teamDoc?.created_at ||
    teamDoc?.createdAt ||
    Date.now();
  return toYearMonth(base);
}
function lastMonthForTeam() {
  return toYearMonth(Date.now());
}

async function listarTimes() {
  return await teams.find();
}

async function meuTime(uid) {
  const filter = {
    $or: [
      { created_by: uid },
      { "created_by.uid": uid },
      { created_by_firebaseUid: uid },
      { representatives: { $elemMatch: { uid } } },
      { representatives: { $elemMatch: { firebaseUid: uid } } },
      { members: { $elemMatch: { uid } } },
      { members: { $elemMatch: { firebaseUid: uid } } },
    ],
  };

  const doc = await teams.findOne(filter).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    name: doc.nome,
    description: doc.description || "",
    created_at: doc.created_at || doc.createdAt || new Date(),
    logo_url: doc.logo_url || "",
  };
}

async function timeUid(uid) {
  try {
    if (!uid) throw new Error("UID ausente no timeUid()");
    const filter = {
      $or: [
        { created_by: uid },
        { "created_by.uid": uid },
        { created_by_firebaseUid: uid },
        { representatives: { $elemMatch: { uid } } },
        { representatives: { $elemMatch: { firebaseUid: uid } } },
        { members: { $elemMatch: { uid } } },
        { members: { $elemMatch: { firebaseUid: uid } } },
      ],
    };
    const docs = await teams.find(filter).lean();
    return (docs || []).map(normalizeTeam).filter(Boolean);
  } catch (e) {
    console.error("[service timeUid] erro:", e);
    throw e;
  }
}

async function buscarTime(id) {
  const team = await teams.findById(id);
  if (!team) throw new Error("time não encontrado.");
  return team;
}

async function criarTime(dados) {
  const {
    nome,
    description,
    logo_url,
    created_by,
    monthly_fee,
    members,
    next_payment_date,
  } = dados;

  if (!nome || !description || !created_by || !monthly_fee || !next_payment_date) {
    throw new Error(
      "Preencha todos os campos obrigatórios (inclua next_payment_date)."
    );
  }

  const jaExiste = await teams.findOne({ nome });
  if (jaExiste) throw new Error("Time já cadastrado com esse nome.");

  const novoTime = await teams.create({
    nome,
    description,
    logo_url: logo_url || "",
    created_by,
    monthly_fee,
    members: Array.isArray(members) && members.length ? members : [created_by],
    next_payment_date: new Date(next_payment_date),
  });

  return novoTime;
}

async function listarMembrosTime(teamId) {
  const team = await teams.findById(teamId);
  if (!team) throw new Error("Time não encontrado");

  const memberUids = toUidArray(team.members);
  const users = await user.find(
    { firebaseUid: { $in: memberUids } },
    "nome firebaseUid"
  );

  const members = memberUids.map((uid) => {
    const userData = users.find((u) => u.firebaseUid === uid);
    let originalUserType = null;
    let position = undefined;
    for (const m of team.members) {
      const val =
        typeof m === "object" ? m.uid || m.firebaseUid || m._id || m.id : m;
      if (String(val) === uid) {
        originalUserType = typeof m === "object" ? m.user_type : null;
        position = typeof m === "object" ? m.position : undefined;
        break;
      }
    }
    return {
      uid,
      user_type: originalUserType,
      position,
      nome: userData?.nome || "Desconhecido",
    };
  });

  return members;
}

async function atualizarTime(id, NovosDados) {
  const team = await teams.findByIdAndUpdate(id, NovosDados, {
    new: true,
    runValidators: true,
  });
  if (!team) throw new Error("time não encontrado.");
  return team;
}

async function deletarTime(id) {
  const team = await teams.findByIdAndDelete(id);
  if (!team) throw new Error("time não encontrado.");
  return { message: "time deletado com sucesso." };
}

async function atualizarPosicaoMembro(teamId, memberUid, newPosition) {
  if (!teamId || !memberUid || !newPosition) {
    throw new Error("Informe teamId, uid do jogador e nova posição.");
  }

  const team = await teams.findOneAndUpdate(
    { _id: teamId, "members.uid": memberUid },
    { $set: { "members.$.position": newPosition } },
    { new: true, runValidators: true }
  );

  if (!team) {
    throw new Error("Time ou membro não encontrado para atualizar posição.");
  }

  return team;
}

async function atualizarEscudoTime(teamId, logoUrl) {
  if (!teamId || !logoUrl) {
    throw new Error("Informe teamId e logoUrl do escudo.");
  }

  const team = await teams.findByIdAndUpdate(
    teamId,
    { logo_url: logoUrl },
    { new: true, runValidators: true }
  );

  if (!team) {
    throw new Error("Time não encontrado para atualizar escudo.");
  }

  return team;
}

async function monthRange(id) {
  const team = await buscarTime(id);
  return {
    firstMonth: firstMonthForTeam(team),
    lastMonth: lastMonthForTeam(),
  };
}

module.exports = {
  listarTimes,
  buscarTime,
  criarTime,
  atualizarTime,
  deletarTime,
  meuTime,
  listarMembrosTime,
  timeUid,
  firstMonthForTeam,
  lastMonthForTeam,
  monthRange,
  atualizarPosicaoMembro,
  atualizarEscudoTime,
};
