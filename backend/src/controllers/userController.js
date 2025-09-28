// Importa o Model User (representa a collection "users" no MongoDB)
const User = require("../models/user");

// Importa o bcrypt (biblioteca para criptografar senhas)
// Aqui ainda não foi usado, mas normalmente seria no cadastro/atualização de senha
const bcrypt = require("bcrypt");


// ===============================
// LISTAR TODOS OS USUÁRIOS
// ===============================
async function listarUsuarios(req, res) {
  try {
    // Busca todos os documentos da coleção de usuários
    const users = await User.find();

    // Retorna a lista em formato JSON
    res.json(users);
  } catch (err) {
    // Se der erro, retorna status 500 (erro interno do servidor)
    res.status(500).json({ error: err.message });
  }
}


// ===============================
// BUSCAR USUÁRIO POR ID
// ===============================
async function buscarUsuario(req, res) {
  try {
    // Busca usuário pelo ID passado na URL (req.params.id)
    const user = await User.findById(req.params.id);

    // Se não encontrar, retorna 404 (não encontrado)
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Se encontrou, retorna o usuário
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// ===============================
// CRIAR NOVO USUÁRIO
// ===============================
async function criarUsuario(req, res) {
  try {
    // Extrai os dados enviados no corpo da requisição (JSON)
    const { nome, email, senha, telefone, user_type } = req.body;

    // Cria um novo objeto User com esses dados
    const novoUser = new User({ nome, email, senha, telefone, user_type });

    // Salva no banco de dados
    await novoUser.save();

    // Retorna status 201 (Created) e o usuário criado
    res.status(201).json(novoUser);
  } catch (err) {
    // Caso algum dado seja inválido, retorna status 400 (Bad Request)
    res.status(400).json({ error: err.message });
  }
}


// ===============================
// ATUALIZAR USUÁRIO EXISTENTE
// ===============================
async function atualizarUsuario(req, res) {
  try {
    // Atualiza usuário pelo ID (req.params.id)
    // req.body contém os novos dados
    const user = await User.findByIdAndUpdate(
      req.params.id,   // ID do usuário que será atualizado
      req.body,        // Novos valores
      { new: true, runValidators: true } // Retorna atualizado + validações do Schema
    );

    // Se não encontrou o usuário para atualizar
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Retorna o usuário atualizado
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


// ===============================
// DELETAR USUÁRIO
// ===============================
async function deletarUsuario(req, res) {
  try {
    // Busca e deleta pelo ID
    const user = await User.findByIdAndDelete(req.params.id);

    // Se não achou, retorna erro 404
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Se deletou com sucesso, retorna mensagem
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// ===============================
// EXPORTANDO FUNÇÕES DO CONTROLLER
// ===============================
// Aqui exportamos as funções para serem usadas no arquivo de rotas (userRoutes.js)
// Assim, cada rota pode chamar sua respectiva função do controller
module.exports = {
  listarUsuarios,
  buscarUsuario,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario
};
