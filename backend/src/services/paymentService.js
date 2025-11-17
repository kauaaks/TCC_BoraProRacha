const mongoose = require('mongoose')
const payments = require('../models/payments')
const Times = require('../models/teams')
const Users = require('../models/user') 
const fs = require('fs')
const path = require('path')

function assertMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("month inválido. Use YYYY-MM.")
}
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v)


const USERS_UID_FIELD = 'firebaseUid'



async function listarPagamentos() {
  return await payments.find()
}

async function buscarPagamento(id) {
  const payment = await payments.findById(id)
  if (!payment) throw new Error("pagamento não encontrado.")
  return payment
}

async function criarPagamento(dados) {
  const { user_id, team_id, amount, due_date, month, status, payment_method } = dados
  if (!user_id || !team_id || !amount || !due_date || !month)
    throw new Error("preencha user_id, team_id, amount, due_date e month.")
  assertMonth(month)

 
  const jaExiste = await payments.findOne({ team_id, user_id, month })
  if (jaExiste) throw new Error("pagamento já cadastrado para esse time/usuário neste mês.")

  const novo = await payments.create({
    user_id,
    team_id,
    amount,
    due_date,
    month,
    status: status || 'pending',
    payment_method: payment_method || null,
  })
  return novo
}

async function atualizarPagamento(id, NovosDados) {
  const payment = await payments.findByIdAndUpdate(id, NovosDados, { new: true, runValidators: true })
  if (!payment) throw new Error("pagamento não encontrado.")
  return payment
}

async function deletarPagamento(id) {
  const payment = await payments.findByIdAndDelete(id)
  if (!payment) throw new Error("pagamento não encontrado.")
  return { message: "pagamento deletado com sucesso."}
}


async function marcarPago({ team_id, user_id, month, rep_id }) {
  assertMonth(month)
  const updated = await payments.findOneAndUpdate(
    { team_id, user_id, month },
    { status: 'paid', paid_at: new Date(), confirmed_by: rep_id || null },
    { new: true, upsert: false }
  )
  if (!updated) throw new Error("registro de pagamento do mês não encontrado.")
  return updated
}

async function marcarNaoPago({ team_id, user_id, month, rep_id }) {
  assertMonth(month)
  const updated = await payments.findOneAndUpdate(
    { team_id, user_id, month },
    { status: 'unpaid', paid_at: null, confirmed_by: rep_id || null },
    { new: true, upsert: false }
  )
  if (!updated) throw new Error("registro de pagamento do mês não encontrado.")
  return updated
}


async function anexarComprovante({ team_id, user_id, month, receipt_url, ctx }) {
  assertMonth(month)
  if (!receipt_url) throw new Error("receipt_url obrigatório.")

  console.log('[anexarComprovante] IN', { team_id, user_id_in: user_id, month, receipt_url })
  console.log('[anexarComprovante] ctx', { uid: ctx?.uid, id: ctx?.id, _id: ctx?._id, user_type: ctx?.user_type })

  if (!user_id && ctx && (ctx.id || ctx._id || ctx.uid)) {
    user_id = ctx.id || ctx._id || ctx.uid
  }
  if (!user_id) throw new Error('identificador de usuário ausente.')

  let userObjectId = null
  if (isObjectId(user_id)) {
    userObjectId = new mongoose.Types.ObjectId(user_id)
  } else if (typeof user_id === 'string' && isObjectId(user_id.toString())) {
    userObjectId = new mongoose.Types.ObjectId(user_id.toString())
  } else {
    const uid = String(user_id || '').trim()
    if (!uid) throw new Error('identificador de usuário ausente.')
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid }).select('_id').lean()
    if (!u?._id) throw new Error('usuário não encontrado (uid).')
    userObjectId = u._id
  }

  const teamFilter = isObjectId(team_id) ? new mongoose.Types.ObjectId(team_id) : team_id
  console.log('[anexarComprovante] resolved', { userObjectId: String(userObjectId), teamFilter, month })

  let doc = await payments.findOne({ team_id: teamFilter, user_id: userObjectId, month })
  console.log('[anexarComprovante] found?', !!doc)

  if (!doc) {
    doc = await payments.create({
      team_id: teamFilter,
      user_id: userObjectId,
      month,
      amount: 0,
      due_date: new Date(),
      status: 'awaiting_approval',
      receipt_url
    })
    console.log('[anexarComprovante] created', { id: String(doc._id) })
    return doc
  }

  if (doc.status !== 'paid') {
    doc.status = 'awaiting_approval'
  }
  doc.receipt_url = receipt_url
  await doc.save()
  console.log('[anexarComprovante] updated', { id: String(doc._id), status: doc.status })
  return doc
}


async function removerComprovante({ team_id, user_id, month, ctx }) {
  assertMonth(month)
  console.log('[removerComprovante] IN', { team_id, user_id_in: user_id, month })
  console.log('[removerComprovante] ctx', { uid: ctx?.uid, id: ctx?.id, _id: ctx?._id, user_type: ctx?.user_type })

  if (!user_id && ctx && (ctx.id || ctx._id || ctx.uid)) {
    user_id = ctx.id || ctx._id || ctx.uid
  }
  if (!user_id) throw new Error('identificador de usuário ausente.')

  let userObjectId = null
  if (isObjectId(user_id)) {
    userObjectId = new mongoose.Types.ObjectId(user_id)
  } else if (typeof user_id === 'string' && isObjectId(user_id.toString())) {
    userObjectId = new mongoose.Types.ObjectId(user_id.toString())
  } else {
    const uid = String(user_id || '').trim()
    if (!uid) throw new Error('identificador de usuário ausente.')
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid }).select('_id user_type').lean()
    if (!u?._id) throw new Error('usuário não encontrado (uid).')
    userObjectId = u._id
  }

  const teamFilter = isObjectId(team_id) ? new mongoose.Types.ObjectId(team_id) : team_id
  console.log('[removerComprovante] resolved', { userObjectId: String(userObjectId), teamFilter, month })

  const doc = await payments.findOne({ team_id: teamFilter, user_id: userObjectId, month })
  console.log('[removerComprovante] found?', !!doc, doc ? String(doc._id) : null)
  if (!doc) throw new Error('registro de pagamento do mês não encontrado.')

  if (ctx && ctx.user_type && ctx.user_type !== 'jogador') {
    throw new Error('apenas jogadores podem remover o próprio comprovante.')
  }

  if (doc.receipt_url && doc.receipt_url.startsWith('/uploads/')) {
    try {
      const abs = path.resolve(process.cwd(), '.' + doc.receipt_url)
      console.log('[removerComprovante] unlink', abs)
      fs.unlink(abs, () => {})
    } catch (e) {
      console.log('[removerComprovante] unlink error', e?.message)
    }
  }

  console.log('[removerComprovante] before reset', { receipt_url: doc.receipt_url, status: doc.status })
  doc.receipt_url = null
  doc.paid_at = null
  if (doc.status !== 'paid') {
    doc.status = 'pending'
  }
  await doc.save()
  console.log('[removerComprovante] after reset', { receipt_url: doc.receipt_url, status: doc.status })

  return { ok: true }
}


async function listarPorTimeEMes({ team_id, month }) {
  assertMonth(month)

  const team = await Times.findById(team_id).lean()
  if (!team) throw new Error('time não encontrado.')

  const uids = (team.members || []).map(m => m.uid)
  const users = await Users.find({ [USERS_UID_FIELD]: { $in: uids } })
    .select('_id nome email ' + USERS_UID_FIELD)
    .lean()
  const byUid = new Map(users.map(u => [u[USERS_UID_FIELD], u]))

  const pays = await payments.find({ team_id, month }).lean()
  const payByUserId = new Map(pays.map(p => [String(p.user_id), p]))

  const defaultDue = new Date(`${month}-15T03:00:00.000Z`)
  const today = new Date()

  const items = (team.members || [])
    .filter(m => ['jogador', 'representante_time', 'admin'].includes(m.user_type))
    .map(m => {
      const u = byUid.get(m.uid)
      const p = u ? payByUserId.get(String(u._id)) : null

      const amount = p?.amount ?? (team.monthly_fee || 0)
      const due_date = p?.due_date ?? defaultDue

      let status = p?.status ?? 'pending'
      if (!p && due_date && today >= new Date(due_date)) status = 'unpaid'

      return {
        _id: p?._id || null,
        user_id: u ? { _id: u._id, nome: u.nome, email: u.email } : { _id: null, nome: 'Sem cadastro', email: '' },
        amount,
        due_date,
        status,
        receipt_url: p?.receipt_url || null,
        paid_at: p?.paid_at || null,
      }
    })

  return items
}


async function listarDoUsuarioNoMes({ user_id, month }) {
  assertMonth(month)
  
  let userObjectId = null
  if (isObjectId(user_id)) userObjectId = new mongoose.Types.ObjectId(user_id)
  else if (typeof user_id === 'string' && isObjectId(user_id.toString())) userObjectId = new mongoose.Types.ObjectId(user_id.toString())
  else {
    const uid = String(user_id || '').trim()
    if (!uid) throw new Error('identificador de usuário ausente.')
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid }).select('_id').lean()
    if (!u?._id) throw new Error('usuário não encontrado (uid).')
    userObjectId = u._id
  }
  return await payments.find({ user_id: userObjectId, month })
}

async function listarDoUsuarioNoMesPorTime({ user_id, team_id, month }) {
  assertMonth(month)
  const teamFilter = isObjectId(team_id) ? new mongoose.Types.ObjectId(team_id) : team_id

  let userObjectId = null
  if (isObjectId(user_id)) userObjectId = new mongoose.Types.ObjectId(user_id)
  else if (typeof user_id === 'string' && isObjectId(user_id.toString())) userObjectId = new mongoose.Types.ObjectId(user_id.toString())
  else {
    const uid = String(user_id || '').trim()
    if (!uid) throw new Error('identificador de usuário ausente.')
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid }).select('_id').lean()
    if (!u?._id) throw new Error('usuário não encontrado (uid).')
    userObjectId = u._id
  }
  return await payments.find({ user_id: userObjectId, team_id: teamFilter, month })
}


 
async function listarCiclosDoUsuario({ user_id, team_id, month }) {
  assertMonth(month)

  
  let userObjectId = null
  if (isObjectId(user_id)) userObjectId = new mongoose.Types.ObjectId(user_id)
  else if (typeof user_id === 'string' && isObjectId(user_id.toString())) userObjectId = new mongoose.Types.ObjectId(user_id.toString())
  else {
    const uid = String(user_id || '').trim()
    if (!uid) throw new Error('identificador de usuário ausente.')
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid }).select('_id').lean()
    if (!u?._id) throw new Error('usuário não encontrado (uid).')
    userObjectId = u._id
  }

  if (team_id) {
    const teamFilter = isObjectId(team_id) ? new mongoose.Types.ObjectId(team_id) : team_id
    return await payments.find({ user_id: userObjectId, team_id: teamFilter, month })
  }
  return await payments.find({ user_id: userObjectId, month })
}

module.exports = {
  listarPagamentos,
  buscarPagamento,
  criarPagamento,
  atualizarPagamento,
  deletarPagamento,
  marcarPago,
  marcarNaoPago,
  anexarComprovante,
  removerComprovante,
  listarPorTimeEMes,
  listarDoUsuarioNoMes,
  listarDoUsuarioNoMesPorTime,
  listarCiclosDoUsuario,
}
