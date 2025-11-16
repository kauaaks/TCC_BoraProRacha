const teams = require('../models/teams');
const user = require('../models/user');

// Utilitário: transforma array heterogêneo em array de UIDs em string
function toUidArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((x) => {
      if (typeof x === "string" || typeof x === "number") return String(x);
      if (x && typeof x === "object") return String(x.firebaseUid || x.uid || x._id || x.id || "");
      return "";
    })
    .filter(Boolean);
}

// Normaliza documento de team para formato consistente
function normalizeTeam(doc) {
  if (!doc) return null;
  // created_by pode ter sido salvo como string (uid) ou objeto { uid, user_type }
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
    member_count: doc.member_count ?? doc.membersCount ?? (Array.isArray(doc.members) ? doc.members.length : 0),
    is_active: typeof doc.is_active === "boolean" ? doc.is_active : doc.isActive ?? true,
    created_at: doc.created_at || doc.createdAt || new Date(),
    created_by_firebaseUid: created_by_uid,
    representatives: toUidArray(doc.representatives),
    members: toUidArray(doc.members)
  };
}

// Lista geral
async function listarTimes() {
  return await teams.find();
}

// Encontra UM time onde o usuário é membro (compatível com seu uso legado)
async function meuTime(uid) {
  // cobre: criador, representante, membro (strings e subdocs)
  const filter = {
    $or: [
      { created_by: uid },
      { "created_by.uid": uid },
      { created_by_firebaseUid: uid },

      { representatives: { $elemMatch: { uid } } },
      { representatives: { $elemMatch: { firebaseUid: uid } } },

      { members: { $elemMatch: { uid } } },
      { members: { $elemMatch: { firebaseUid: uid } } }
    ]
  };

  const doc = await teams.findOne(filter).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    name: doc.nome,
    description: doc.description || "",
    created_at: doc.created_at || doc.createdAt || new Date()
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
        { members: { $elemMatch: { firebaseUid: uid } } }
      ]
    };

    const docs = await teams.find(filter).lean();
    return (docs || []).map(normalizeTeam).filter(Boolean);
  } catch (e) {
    console.error("[service timeUid] erro:", e);
    throw e;
  }
}



// Busca por ID
async function buscarTime(id) {
  const team = await teams.findById(id);
  if (!team) throw new Error("time não encontrado.");
  return team;
}

// Criação (aceita dados que o controller montou)
async function criarTime(dados) {
  const { nome, description, logo_url, created_by, monthly_fee, members } = dados;

  if (!nome || !description || !created_by || !monthly_fee) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  const jaExiste = await teams.findOne({ nome });
  if (jaExiste) throw new Error("Time já cadastrado com esse nome.");

  // created_by e members já vêm no formato do controller:
  // created_by: { uid, user_type }
  // members: [{ uid, user_type }]
  const novoTime = await teams.create({
    nome,
    description,
    logo_url: logo_url || "",
    created_by,        // objeto com uid (compatível com filtros "created_by.uid")
    monthly_fee,
    members: Array.isArray(members) && members.length ? members : [created_by]
  });

  return novoTime;
}

// Lista membros de um time com join por Users
async function listarMembrosTime(teamId) {
  const team = await teams.findById(teamId);
  if (!team) throw new Error("Time não encontrado");

  // Extrai UIDs do array heterogêneo em team.members
  const memberUids = toUidArray(team.members);

  // Busca usuários pelo firebaseUid
  const users = await user.find(
    { firebaseUid: { $in: memberUids } },
    "nome firebaseUid"
  );

  const members = memberUids.map(uid => {
    const userData = users.find(u => u.firebaseUid === uid);
    // recuperar o user_type original se existir na lista do time
    let originalUserType = null;
    for (const m of team.members) {
      const val = typeof m === "object" ? (m.uid || m.firebaseUid || m._id || m.id) : m;
      if (String(val) === uid) {
        originalUserType = typeof m === "object" ? m.user_type : null;
        break;
      }
    }
    return {
      uid,
      user_type: originalUserType,
      nome: userData?.nome || "Desconhecido"
    };
  });

  return members;
}

// Atualização por ID
async function atualizarTime(id, NovosDados) {
  const team = await teams.findByIdAndUpdate(id, NovosDados, {
    new: true,
    runValidators: true
  });
  if (!team) throw new Error("time não encontrado.");
  return team;
}

// Deleção por ID
async function deletarTime(id) {
  const team = await teams.findByIdAndDelete(id);
  if (!team) throw new Error("time não encontrado.");
  return { message: "time deletado com sucesso." };
}

module.exports = {
  listarTimes,
  buscarTime,
  criarTime,
  atualizarTime,
  deletarTime,
  meuTime,
  listarMembrosTime,
  timeUid
};
