const payments = require('../models/payments');

async function listarPagamentos() {
    return await payments.find();
}

async function buscarPagamento(id) {
    const payment = await payments.findById(id);
    if (!payment) throw new Error("pagamento não encontrado.");
    return payment;
}

async function criarPagamento(dados) {
    const {user_id, team_id, amount, due_date, payment_date, status, payment_method } = dados;
    if (!user_id || !team_id || !amount || !due_date || !status || !payment_method)
        throw new Error("preencha todos os campos obrigatórios.");
    const jaExiste = await payments.findOne({team_id});
    if (jaExiste) throw new Error("pagamento ja cadastrado para esse time.");
    const novoPagamento = await payments.create({
        user_id,
        team_id,
        amount,
        due_date,
        payment_date,
        status,
        payment_method
    });
    return novoPagamento;
}

async function atualizarPagamento(id, NovosDados) {
    const payment = await payments.findByIdAndUpdate(id, NovosDados, {
        new: true,
        runValidators: true
    });
    if (!payment) throw new Error("pagamento não encontrado.");
    return payment;
}

async function deletarPagamento(id) {
    const payment = await payments.findByIdAndDelete(id);
    if (!payment) throw new Error("pagamento não encontrado.");
    return { message: "pagamento deletado com sucesso."};
}

module.exports = {
    listarPagamentos,
    buscarPagamento,
    criarPagamento,
    atualizarPagamento,
    deletarPagamento
};