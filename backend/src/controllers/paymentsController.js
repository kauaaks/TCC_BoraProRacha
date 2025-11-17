
const paymentService = require('../services/paymentService');

async function listarPagamentos(req, res) {
  try { res.json(await paymentService.listarPagamentos()) }
  catch (err) { res.status(500).json({ error: err.message }) }
}

async function buscarPagamento(req, res) {
  try { res.status(200).json(await paymentService.buscarPagamento(req.params.id)) }
  catch (err) { res.status(404).json({ error: err.message }) }
}

async function criarPagamento(req, res) {
  try { res.status(201).json(await paymentService.criarPagamento(req.body)) }
  catch (err) { res.status(400).json({ error: err.message }) }
}

async function atualizarPagamento(req, res) {
  try { res.status(200).json(await paymentService.atualizarPagamento(req.params.id, req.body, { new: true, runValidators: true })) }
  catch (err) { res.status(400).json({ error: err.message }) }
}

async function deletarPagamento(req, res) {
  try { res.status(200).json(await paymentService.deletarPagamento(req.params.id)) }
  catch (err) { res.status(500).json({ error: err.message }) }
}



async function listarTimeMes(req, res) {
  try {
    const { teamId } = req.params
    const { month } = req.query
    const items = await paymentService.listarPorTimeEMes({ team_id: teamId, month })
    res.json({ items })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function listarUsuarioMes(req, res) {
  try {
    const { month, teamId } = req.query
    const userId = req.user?.id || req.user?._id || req.query.userId
    const items = await paymentService.listarCiclosDoUsuario({ user_id: userId, team_id: teamId || null, month })
    res.json({ items })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function marcarPago(req, res) {
  try { res.json(await paymentService.marcarPago({ ...req.body, rep_id: req.user?.id || req.user?._id || null })) }
  catch (err) { res.status(400).json({ error: err.message }) }
}

async function marcarNaoPago(req, res) {
  try { res.json(await paymentService.marcarNaoPago({ ...req.body, rep_id: req.user?.id || req.user?._id || null })) }
  catch (err) { res.status(400).json({ error: err.message }) }
}

async function uploadComprovante(req, res) {
  try {
    if (!req.file) throw new Error("arquivo obrigatório (campo 'file').")
    const receiptUrl = `/uploads/receipts/${req.file.filename}`
    const { teamId, userId, month } = req.body
    const payment = await paymentService.anexarComprovante({ team_id: teamId, user_id: userId, month, receipt_url: receiptUrl, ctx: req.user })
    res.json({ ok: true, receipt_url: receiptUrl, payment })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

async function removerComprovante(req, res) {
  try {
    const { team_id, user_id, month } = req.body
    const out = await paymentService.removerComprovante({ team_id, user_id: user_id || null, month, ctx: req.user })
    res.json(out)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = {
  listarPagamentos,
  buscarPagamento,
  criarPagamento,
  atualizarPagamento,
  deletarPagamento,
  listarTimeMes,
  listarUsuarioMes,
  marcarPago,
  marcarNaoPago,
  uploadComprovante,
  removerComprovante,
}
