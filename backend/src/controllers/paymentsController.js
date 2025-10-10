const paymentService = require('../services/paymentService');

async function listarPagamentos(req, res) {
  try {
    const payments = await paymentService.listarPagamentos();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarPagamento(req, res) {
  try {
    const payment = await paymentService.buscarPagamento(req.params.id);
    res.status(200).json(payment);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function criarPagamento(req, res) {
    try {
        const novoPayment = await paymentService.criarPagamento(req.body);
        res.status(201).json(novoPayment);
    }   catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function atualizarPagamento(req, res) {
    try {
        const payment = await paymentService.atualizarPagamento(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
        );
        res.status(200).json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
} 

async function deletarPagamento(req, res) {
    try {
        const payment = await paymentService.deletarPagamento(req.params.id);
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    listarPagamentos,
    buscarPagamento,
    criarPagamento,
    atualizarPagamento,
    deletarPagamento
};