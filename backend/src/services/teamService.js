const teams = require('../models/teams');
const user = require('../models/user');

async function listarTimes() {
    return await teams.find();
}

async function meuTime(uid) {
  const team = await teams.findOne({ 'members.uid': uid })
  if (!team) return null

  return {
    id: team._id,
    name: team.nome,
    description: team.description,
    created_at: team.createdAt
  }
}

async function buscarTime(id) {
    const team = await teams.findById(id);
    if (!team) throw new Error("time não encontrado.");
    return team;
}

async function criarTime(dados) {
    const { nome, description, logo_url, created_by, monthly_fee } = dados;

    if (!nome || !description || !created_by || !monthly_fee) {
        throw new Error("Preencha todos os campos obrigatórios.");
    }

    // Verifica se já existe um time com esse nome
    const jaExiste = await teams.findOne({ nome });
    if (jaExiste) throw new Error("Time já cadastrado com esse nome.");

    // Cria o novo time
    const novoTime = await teams.create({
        nome,
        description,
        logo_url: logo_url || "",      
        created_by,                     //salva o UID do Firebase
        monthly_fee,
        members: [created_by]          
    });

    return novoTime;
}

async function listarMembrosTime(teamId) {
  // Busca o time
  const team = await teams.findById(teamId);

  if (!team) {
    throw new Error("Time não encontrado");
  }

  // Extrai os UIDs do team.members (que usam 'uid')
  const memberUids = team.members.map(m => m.uid);

  // Busca usuários pelo firebaseUid (do model User)
  const users = await user.find(
    { firebaseUid: { $in: memberUids } },
    "nome firebaseUid"
  );

  // Junta os dados do membro
  const members = team.members.map(member => {
    const userData = users.find(u => u.firebaseUid === member.uid);
    return {
      uid: member.uid,
      user_type: member.user_type,
      nome: userData?.nome || "Desconhecido"
    };
  });

  return members;
}




async function atualizarTime(id, NovosDados) {
    const team = await teams.findByIdAndUpdate(id, NovosDados, {
        new: true,
        runValidators: true
    });

    if (!team) throw new Error("time não encontrado.");
    return team;
}

async function deletarTime(id) {
    const team = await teams.findByIdAndDelete(id);
    if (!team) throw new Error("time não encontrado.");
    return { message: "time deletado com sucesso."};
}

module.exports = {
    listarTimes,
    buscarTime,
    criarTime,
    atualizarTime,
    deletarTime,
    meuTime,
    listarMembrosTime
};
