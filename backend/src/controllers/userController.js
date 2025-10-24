// Importa as funções criadas na service de usuários
const userService = require("../services/userService");


async function getUserStats(req,res) {
  try{
    const stats = await userService.getUserStats(req.params.id);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}
/**
 * Controller que lista todos os usuários
 * Endpoint exemplo: GET /api/users
 */
async function listarUsuarios(req, res) {
  try {
    const users = await userService.listarUsuarios(); // Chama a função da service
    res.status(200).json(users); // Retorna os usuários encontrados com status 200 (OK)
  } catch (err) {
    res.status(500).json({ error: err.message }); // Erro interno do servidor
  }
}

/**
 * Controller que busca um usuário específico pelo ID
 * Endpoint exemplo: GET /api/users/:id
 */
async function buscarUsuario(req, res) {
  try {
    // req.params.id captura o ID enviado na URL
    const user = await userService.buscarUsuarioPorId(req.params.id);
    res.status(200).json(user); // Retorna o usuário com status 200
  } catch (err) {
    res.status(404).json({ error: err.message }); // Caso o ID não exista, erro 404
  }
}

/**
 * Controller que cria um novo usuário
 * Endpoint exemplo: POST /api/users
 * O corpo (req.body) vem com os dados enviados pelo cliente
 */
async function criarUsuario(req, res) {
  try {
    const novoUser = await userService.criarUsuario(req.body);
    res.status(201).json(novoUser); // 201 = criado com sucesso
  } catch (err) {
    res.status(400).json({ error: err.message }); // 400 = erro de validação
  }
}

/**
 * Controller que atualiza um usuário existente
 * Endpoint exemplo: PUT /api/users/:id
 */
async function atualizarUsuario(req, res) {
  try {
    const user = await userService.atualizarUsuario(req.params.id, req.body);
    res.status(200).json(user); // Retorna o usuário atualizado
  } catch (err) {
    res.status(400).json({ error: err.message }); // Erro na atualização ou validação
  }
}

/**
 * Controller que deleta um usuário
 * Endpoint exemplo: DELETE /api/users/:id
 */
async function deletarUsuario(req, res) {
  try {
    const result = await userService.deletarUsuario(req.params.id);
    res.status(200).json(result); // Retorna mensagem de sucesso
  } catch (err) {
    res.status(404).json({ error: err.message }); // Usuário não encontrado
  }
}

// Exporta todas as funções para serem usadas nas rotas
module.exports = {
  listarUsuarios,
  buscarUsuario,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  getUserStats
};
