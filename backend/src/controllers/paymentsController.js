const Payments = require("../models/payments");

async function listarPagamentos(req, res) {
  try {
    const payments = await Payments.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarPagamento(req, res) {
  try {
    const payment = await Payments.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Pagamento não encontrado" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function criarPagamento(req, res) {
    try {
        const { user_id, team_id, amount, due_date, payment_date, status, method } = req.body;
        const novoPayment = new Payments({ user_id, team_id, amount, due_date, payment_date, status, method });
        await novoPayment.save();
        res.status(201).json(novoPayment);
    }   catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function atualizarPagamento(req, res) {
    try {
        const payment = await Payments.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
        );

        if (!payment) return res.status(404).json({ error: "Pagamento não encontrado" });
        
        res.json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
} 

async function deletarPagamento(req, res) {
    try {
        const payment = await Payments.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ error: "Pagamento não encontrado" });
        res.json({ message: "Pagamento deletado com sucesso" });
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