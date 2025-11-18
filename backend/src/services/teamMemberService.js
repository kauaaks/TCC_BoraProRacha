const teamMembers = require('../models/team_members');
const Times = require('../models/teams');
const Users = require('../models/user');
const payments = require('../models/payments');
const mongoose = require('mongoose');

function toYearMonth(dateLike) {
  const d = new Date(dateLike || Date.now());
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function listarMembros() {
  return await teamMembers.find();
}

async function buscarMembro(id) {
  const membro = await teamMembers.findById(id);
  if (!membro) throw new Error("membro não encontrado.");
  return membro;
}

async function criarMembro(dados) {
  const { user_id, team_id, role, joined_at, monthly_payment_status} = dados;
  if (!user_id || !team_id || !role)
    throw new Error("preencha todos os campos obrigatórios.");

  const jaExiste = await teamMembers.findOne({user_id, team_id});
  if (jaExiste) throw new Error("membro ja cadastrado nesse time.");

  const novoMembro = await teamMembers.create({
    user_id,
    team_id,
    role,
    joined_at: joined_at || undefined,
    monthly_payment_status: monthly_payment_status || undefined
  });

  // Cria/garante um pagamento pendente para o mês de referência
  try {
    const team = await Times.findById(team_id).lean();
    const userObjId = new mongoose.Types.ObjectId(user_id);
    const yearMonth = toYearMonth(team?.next_payment_date || Date.now());
    const defaultDue = team?.next_payment_date ? new Date(team.next_payment_date) : new Date(`${yearMonth}-15T03:00:00.000Z`);
    const amount = team?.monthly_fee || 0;

    await payments.findOneAndUpdate(
      { team_id, user_id: userObjId, month: yearMonth },
      {
        $setOnInsert: {
          amount,
          due_date: defaultDue,
          status: 'pending',
          receipt_url: null,
          paid_at: null,
          confirmed_by: null,
          payment_method: null
        }
      },
      { upsert: true, new: true }
    ); // [web:41][web:44]
  } catch (e) {
    // não bloquear fluxo de membro por erro no pagamento; logue para inspeção
    console.error('[team_memberService.criarMembro] upsert payment error:', e.message);
  }

  return novoMembro;
}

async function atualizarMembro(id, novosDados) {
  const membro = await teamMembers.findByIdAndUpdate(id, novosDados, {
    new: true,
    runValidators: true
  });
  if (!membro) throw new Error("membro não encontrado.");
  return membro;
}

async function deletarMembro(id) {
  const membro = await teamMembers.findByIdAndDelete(id);
  if (!membro) throw new Error("membro não encontrado.");
  return { message: "membro deletado com sucesso."};
}

module.exports = {
  listarMembros,
  buscarMembro,
  criarMembro,
  atualizarMembro,
  deletarMembro
};
