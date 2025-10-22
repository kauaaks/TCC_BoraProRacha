// Importa o model do usuário, que representa a coleção "users" no MongoDB
const User = require("../models/User");
// Importa o bcrypt, usado para criptografar (hashear) senhas antes de salvar
const bcrypt = require("bcrypt");
import admin from "../config/firebase.js";

const allowedRoles = ["admin", "representante_time", "gestor_campo", "jogador"];
/**
 * Lista todos os usuários cadastrados no banco.
 * Não precisa de parâmetros, apenas retorna todos os registros.
 */
async function listarUsuarios() {
  return await User.find(); // Retorna todos os usuários encontrados no MongoDB
}

/**
 * Busca um único usuário pelo ID.
 * @param {String} id - ID do usuário no banco (ObjectId do MongoDB)
 */
async function buscarUsuarioPorId(id) {
  const user = await User.findById(id); // Procura o usuário com base no ID
  if (!user) throw new Error("Usuário não encontrado"); // Caso não exista, lança erro
  return user; // Retorna o usuário encontrado
}

/**
 * Cria um novo usuário.
 * @param {Object} dados - Dados enviados pelo cliente (nome, email, senha, etc)
 */
async function criarUsuario(dados) {
  const { nome, email, senha, telefone, user_type } = dados;

  // 1️⃣ Valida se todos os campos obrigatórios foram enviados
  if (!nome || !email || !senha || !telefone || !user_type)
    throw new Error("Preencha todos os campos obrigatórios");

   // 2️⃣ Verifica role válida
  if (!allowedRoles.includes(user_type)) {
    throw new Error("Função inválida");
  }

  // 2️⃣ Verifica se já existe um usuário com o mesmo e-mail
  const jaExiste = await User.findOne({ email });
  if (jaExiste) throw new Error("Email já cadastrado");

  // 3️⃣ Cria o usuário no Firebase Authentication
  const userRecord = await admin.auth().createUser({
    email,
    password: senha, // Firebase gerencia a senha
    displayName: nome,
    phoneNumber: telefone // opcional
  });

  // 4️⃣ Cria e salva o novo usuário no banco
  const novoUser = await User.create({
    nome,
    email,
    telefone,
    user_type,
    FirebaseUid: userRecord.uid // vincula usuário Mongo ao Firebase
  });

  return novoUser; // Retorna o usuário recém-criado
}

/**
 * Atualiza os dados de um usuário existente.
 * @param {String} id - ID do usuário a ser atualizado
 * @param {Object} novosDados - Campos a serem atualizados
 */
async function atualizarUsuario(id, novosDados) {
  const user = await User.findByIdAndUpdate(id, novosDados, {
    new: true, // Retorna o objeto atualizado, não o antigo
    runValidators: true // Respeita as validações definidas no Schema
  });

  if (!user) throw new Error("Usuário não encontrado");
  return user; // Retorna o usuário atualizado
}

/**
 * Deleta um usuário do banco.
 * @param {String} id - ID do usuário a ser deletado
 */
async function deletarUsuario(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("Usuário não encontrado");
  return { message: "Usuário deletado com sucesso" }; // Retorna mensagem de sucesso
}

// Exporta todas as funções para serem usadas em outros arquivos (como na Controller)
module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario
};
